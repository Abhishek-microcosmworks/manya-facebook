import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { AccessToken, RefreshToken } from 'models/auth';
import { ROLE_VALUES, User } from 'models/user/user.schema';
import { Model } from 'mongoose';
import { CustomLogger } from 'src/common/services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: CustomLogger,

    @InjectModel(AccessToken.name) private accessTokenModel: Model<AccessToken>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authority = this.reflector.get<boolean>(
      'authority',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const authHeader = request.get('Authorization');
    const authorization = authHeader ? authHeader.split(' ')[1] : null;

    if (!authorization) {
      throw new UnauthorizedException('Login to access this route...');
    }

    try {
      const accessToken = await this.accessTokenModel.findOne({
        token: authorization,
        isExpired: false,
      });

      if (!accessToken) {
        throw new UnauthorizedException(
          'Authentication token is missing or invalid. Please log in again.',
        );
      }

      const refreshToken = await this.refreshTokenModel.findById(
        accessToken.refreshTokenId,
      );

      if (!refreshToken) {
        throw new UnauthorizedException(
          'Authentication token is missing or invalid. Please log in again.',
        );
      }

      const now = new Date(Date.now());
      const oneHour = 60 * 60 * 1000;

      if (accessToken.expiry <= now || accessToken.isExpired) {
        if (
          accessToken.expiry.getTime() + oneHour >=
          refreshToken.expiry.getTime()
        ) {
          await this.invalidateTokens(accessToken, refreshToken);
          throw new UnauthorizedException(
            'Session expired. Please log in again.',
          );
        }

        // Extend access token expiry by 1 hour
        accessToken.expiry = new Date(now.getTime() + oneHour);
        await accessToken.save();
      }

      const user = await this.userModel.findById(accessToken.userId.toString());

      if (!user.isEmailVerified) {
        throw new UnauthorizedException(
          'Your account is not verified. Please verify your account first.',
        );
      }

      if (!authority) {
        request['user'] = user;
        return true;
      }

      const isAdmin = user.role === ROLE_VALUES.ADMIN;

      if (isAdmin) {
        request['user'] = user;
        return true;
      }

      throw new UnauthorizedException(
        'User does not have permissions to access this route.',
      );
    } catch (error) {
      throw error;
    }
  }

  private async invalidateTokens(
    accessToken: AccessToken,
    refreshToken: RefreshToken,
  ): Promise<void> {
    accessToken.isExpired = true;
    refreshToken.isExpired = true;

    await accessToken.save();
    await refreshToken.save();
  }
}
