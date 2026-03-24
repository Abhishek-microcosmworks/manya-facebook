import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'models/user';
import { Model, Types } from 'mongoose';
import {
  LoginReqDto,
  LoginResDto,
  LogoutResDto,
  RegisterReqDto,
  RegisterResDto,
} from './credentials-auth-dto';
import { UserVerificationService } from './common';
import { CustomLogger } from 'src/common/services/logger.service';
import { AccessToken, RefreshToken } from 'models/auth';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserProfileDto } from 'src/user/user/user-dto';
import { v4 as uuidv4 } from 'uuid';
import { Profile } from 'models/profile/profile.schema';

@Injectable()
export class CredentialsAuthService {
  // Read env vars once at startup so misconfiguration fails fast
  private readonly jwtAccessSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtAccessLifetime: string;
  private readonly jwtRefreshLifetime: string;
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<Profile>,

    @InjectModel(AccessToken.name)
    private readonly accessTokenModel: Model<AccessToken>,

    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,

    private readonly logger: CustomLogger,
    private readonly userVerficationService: UserVerificationService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext('CredentialsAuth');

    this.jwtAccessSecret = process.env.JWT_ACCESS_TOKEN_SECRET!;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET!;
    this.jwtAccessLifetime = process.env.JWT_ACCESS_TOKEN_LIFETIME!;
    this.jwtRefreshLifetime = process.env.JWT_REFRESH_TOKEN_LIFETIME!;
    this.accessTokenExpiry = Number(process.env.ACCESS_TOKEN_EXPIRY);
    this.refreshTokenExpiry = Number(process.env.REFRESH_TOKEN_EXPIRY);
  }

  // ─── Register ────────────────────────────────────────────────────────────────

  async register(
    registerData: RegisterReqDto,
    req: Request,
  ): Promise<RegisterResDto> {
    const { name, email, password, acceptTerms } = registerData;

    if (!acceptTerms) {
      throw new BadRequestException(
        'To proceed, please agree to our terms and conditions.',
      );
    }

    // Only fetch the fields we need to evaluate the duplicate/deleted check
    const existing = await this.userModel
      .findOne({ email })
      .select('isDeleted')
      .lean();

    if (existing) {
      throw new BadRequestException(
        existing.isDeleted
          ? 'This account has been deactivated by the admin as per your request. Contact the admin for reactivation.'
          : 'An account with this email already exists.',
      );
    }

    const baseUsername = name.toLowerCase().replace(/\s+/g, '.');
    const uniqueId = uuidv4().replace(/-/g, '').slice(0, 8);
    const autoUsername = `${baseUsername}.${uniqueId}`;

    const newUser = await this.userModel.create({
      name,
      email,
      password,
      acceptTerms,
      username: autoUsername,
    });

    // create user and link the profile without blocking registration if profile creation fails
    // and it will be auto-created & linked on the user's first login.
    this.profileModel
      .create({ user_id: newUser._id })
      .then((newProfile) =>
        this.userModel.findByIdAndUpdate(newUser._id, {
          profile: newProfile._id,
        }),
      )
      .catch((err: Error) =>
        this.logger.warn(
          `Profile creation failed for user ${newUser._id} — will be auto-created on first login. Reason: ${err.message}`,
        ),
      );

    this.userVerficationService.sendVerificationEmail(newUser, req);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      msg: 'Registration complete! Verification email sent.',
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────────

  async login(loginData: LoginReqDto, req: Request): Promise<LoginResDto> {
    const { email, password } = loginData;

    const user = await this.validateUser(email);

    if (!user.isEmailVerified) {
      this.userVerficationService.resendVerificationEmail(user, req);
      throw new ForbiddenException(
        'User was not verified. A new verification link has been sent.',
      );
    }

    await this.verifyAccountPassword(user, password);

    // Guarantee profile exists. Uses upsert so it's a no-op on subsequent logins.
    // If the profile was missing, atomically link it to the user in the same step.
    const profile = await this.profileModel.findOneAndUpdate(
      { user_id: user.id },
      { $setOnInsert: { user_id: user.id } },
      { upsert: true, new: true },
    );

    if (!user.profile) {
      // Profile was missing — link it now and log for observability
      await this.userModel.findByIdAndUpdate(user.id, { profile: profile._id });
      this.logger.warn(`Profile auto-created on login for user ${user.id}.`);
    }

    // Invalidate all previous sessions (one active session per user)
    await this.invalidatePreviousSessions(user.id);

    const refreshTokenData = await this.generateRefreshToken(user);
    const accessTokenData = await this.generateAccessToken(user, refreshTokenData);

    return this.sendLoginResponse(user, accessTokenData.token, accessTokenData.expiryInMs);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(authHeader: string): Promise<LogoutResDto> {
    const authorization = authHeader.split(' ')[1];

    const accessToken = await this.accessTokenModel.findOne({
      token: authorization,
    });

    if (!accessToken) {
      throw new UnauthorizedException(
        'Access token is missing. Please log in again.',
      );
    }

    await this.accessTokenModel.findOneAndUpdate(
      {
        token: authorization,
      },
      {
        expiry: Date.now(),
        isExpired: true,
      },
    );

    await this.refreshTokenModel.findByIdAndUpdate(accessToken.refreshTokenId, {
      expiry: Date.now(),
      isExpired: true,
    });

    return {
      error: false,
      statusCode: HttpStatus.OK,
      msg: 'You have logged out successfully!',
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async invalidatePreviousSessions(userId: string): Promise<void> {
    const hasSession = await this.refreshTokenModel
      .exists({ userId, isExpired: false });

    if (!hasSession) return;

    // Expire all stale sessions in parallel
    await Promise.all([
      this.refreshTokenModel.updateMany({ userId }, { isExpired: true }),
      this.accessTokenModel.findOneAndUpdate(
        { userId, isExpired: false },
        { isExpired: true },
      ),
    ]);
  }

  private async validateUser(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .populate('profile');

    if (!user) {
      throw new NotFoundException(
        "This account doesn't seem to exist. Please sign up to get started!",
      );
    }

    return user;
  }

  private async verifyAccountPassword(
    user: User,
    password: string,
  ): Promise<void> {
    const isPasswordMatched = await argon2.verify(user.password, password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password.');
    }
  }

  private async generateRefreshToken(user: User): Promise<RefreshToken> {
    const payload = { email: user.email, user: { id: user.id, name: user.name } };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.jwtRefreshLifetime,
      subject: user.email,
      algorithm: 'HS512',
      secret: this.jwtRefreshSecret,
    });

    return this.refreshTokenModel.create({
      token,
      expiry: new Date(Date.now() + this.refreshTokenExpiry),
      userId: user.id,
    });
  }

  private async generateAccessToken(
    user: User,
    refreshToken: RefreshToken,
  ): Promise<{ token: string; expiryInMs: Date }> {
    const payload = { email: user.email, user: { id: user.id, name: user.name } };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.jwtAccessLifetime,
      subject: user.email,
      algorithm: 'HS512',
      secret: this.jwtAccessSecret,
    });

    const expiryInMs = new Date(Date.now() + this.accessTokenExpiry);

    await this.accessTokenModel.create({
      token,
      expiry: expiryInMs,
      userId: user.id,
      refreshTokenId: refreshToken.id,
    });

    return { token, expiryInMs };
  }

  private sendLoginResponse(
    user: User,
    accessToken: string,
    expiry: Date,
  ): LoginResDto {
    return {
      error: false,
      statusCode: HttpStatus.OK,
      msg: 'You have logged in successfully!',
      accessToken,
      expiry,
      user: UserProfileDto.transform(user),
    } as LoginResDto;
  }
}
