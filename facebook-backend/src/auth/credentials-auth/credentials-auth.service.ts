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
import { Model } from 'mongoose';
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

@Injectable()
export class CredentialsAuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(AccessToken.name)
    private readonly accessTokenModel: Model<AccessToken>,

    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,

    private readonly logger: CustomLogger,
    private readonly userVerficationService: UserVerificationService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext('CredentialsAuth');
  }

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

    try {
      const user = await this.userModel.findOne({ email });

      if (user) {
        if (user.isDeleted) {
          throw new BadRequestException(
            'This account has been deactivated by the admin as per your request. Contact the admin for reactivation.',
          );
        } else {
          throw new BadRequestException(
            'An account with this email already exists.',
          );
        }
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

      newUser.email = email;

      this.userVerficationService.sendVerificationEmail(newUser, req);

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'Registration complete! Verification email sent.',
      };
    } catch (error) {
      throw error;
    }
  }

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

  async login(loginData: LoginReqDto, req: Request): Promise<LoginResDto> {
    try {
      const { email, password } = loginData;
      console.log('Starting login for:', {loginData} );

      const user = await this.validateUser(email);

      if (!user.isEmailVerified) {
        this.userVerficationService.resendVerificationEmail(user, req);

        throw new ForbiddenException(
          'User was not verified, verification link has been sent to user !!',
        );
      }

      await this.verifyAccountPassword(user, password);
      console.log('Password verified');

      // A user can only have one active session at a time
      const userRefreshToken = await this.refreshTokenModel.findOne({
        userId: user.id,
      });

      if (userRefreshToken) {
        await this.refreshTokenModel.updateMany(
          { userId: user.id },
          {
            isExpired: true,
          },
        );

        await this.accessTokenModel.findOneAndUpdate(
          {
            userId: user.id,
            isExpired: false,
          },
          {
            isExpired: true,
          },
        );
      }

      const refreshTokenData = await this.generateRefreshToken(user);
      console.log('Refresh token generated');
      const accessTokenData = await this.generateAccessToken(
        user,
        refreshTokenData,
      );
      console.log('Access token generated');

      return this.sendLoginResponse(
        user,
        accessTokenData.token,
        accessTokenData.expiryInMs,
      );
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private async validateUser(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).select('+password');

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
    console.log('Verifying password', user.password, password);

    const isPasswordMatched = await argon2.verify(user.password, password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password.');
    }
  }

  async generateRefreshToken(user: User): Promise<RefreshToken> {
    const payload = {
      email: user.email,
      user: {
        id: user.id,
        name: user.name,
      },
    };

    const jwtRefreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_LIFETIME,
      subject: user.email,
      algorithm: 'HS512',
      secret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    });

    const expiryInMs = new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY),
    );

    const newRefreshToken = await this.refreshTokenModel.create({
      token: jwtRefreshToken,
      expiry: expiryInMs,
      userId: user.id,
    });

    return newRefreshToken;
  }

  async generateAccessToken(
    user: User,
    refreshToken: RefreshToken,
  ): Promise<{
    token: string;
    expiryInMs: Date;
  }> {
    const payload = {
      email: user.email,
      user: {
        id: user.id,
        name: user.name,
      },
    };

    const jwtAccessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_LIFETIME,
      subject: user.email,
      algorithm: 'HS512',
      secret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    });

    const expiryInMs = new Date(
      Date.now() + Number(process.env.ACCESS_TOKEN_EXPIRY),
    );

    await this.accessTokenModel.create({
      token: jwtAccessToken,
      expiry: expiryInMs,
      userId: user.id,
      refreshTokenId: refreshToken.id,
    });

    return { token: jwtAccessToken, expiryInMs };
  }

  private sendLoginResponse(
    user: User,
    accessToken: string,
    expiry: Date,
  ): LoginResDto {
    const userProfile = UserProfileDto.transform(user);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      msg: 'You have logged in successfully!',
      accessToken,
      expiry,
      user: userProfile,
    } as LoginResDto;
  }
}
