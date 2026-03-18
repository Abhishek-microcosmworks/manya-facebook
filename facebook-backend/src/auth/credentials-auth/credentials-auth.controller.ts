import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CredentialsAuthService } from './credentials-auth.service';
import {
  LoginReqDto,
  LoginResDto,
  RegisterReqDto,
  RegisterResDto,
} from './credentials-auth-dto';
import { UserVerificationService } from './common';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import {
  forgotPassReqDTO,
  forgotPassResDTO,
  ResetPassReqDTO,
  ResetPassResDTO,
} from './common/user-verification-dto';
import { ErrorResponse } from 'src/utils/responses';
import { AuthGuard } from 'src/middlewares';

@ApiTags('Authentication')
@Controller()
export class CredentialsAuthController {
  constructor(
    private readonly credentialsAuthService: CredentialsAuthService,
    private readonly userVerificationService: UserVerificationService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Registers a new user.',
    type: RegisterResDto,
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @Post('/register')
  async register(@Body() registerData: RegisterReqDto, @Req() req: Request) {
    return this.credentialsAuthService.register(registerData, req);
  }

  @ApiResponse({
    status: 200,
    description: 'Verifies the email confirmation token.',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @ApiParam({
    name: 'token',
    description: 'Verification token sent to the user email.',
  })
  @Get('/verify_user/:token')
  @Render('verification-result')
  async verify(@Param('token') token: string) {
    const isValid =
      await this.userVerificationService.validateVerificationToken(token);

    return {
      isValid,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Authenticates and logs in a user.',
    type: LoginResDto,
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @Post('login')
  async login(@Body() loginData: LoginReqDto, @Req() req: Request) {
    

    return this.credentialsAuthService.login(loginData, req);
  }

  @ApiResponse({
    status: 200,
    description: 'Logs out the user by invalidating the token.',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @ApiBearerAuth()
  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    const authHeader = req.headers.authorization;

    return this.credentialsAuthService.logout(authHeader);
  }

  @ApiResponse({
    status: 200,
    description: 'Sends a forgot password email with a reset link.',
    type: forgotPassResDTO,
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @Put('forget_password')
  async ForgotPassword(
    @Body() forgotPassData: forgotPassReqDTO,
    @Req() req: Request,
  ) {
    return this.userVerificationService.sendForgotPassEmail(
      forgotPassData,
      req,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'Validates the forgot password reset token.',
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @ApiParam({
    name: 'token',
    description: 'Password reset token sent in the email.',
  })
  @Get('/forget_password/:token')
  @Render('forgot-pass-result')
  async forgotPass(@Param('token') token: string) {
    const isValid =
      await this.userVerificationService.validateForgotPassToken(token);

    return {
      isValid,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Resets the user password.',
    type: ResetPassResDTO,
  })
  @ApiResponse({
    status: 404,
    type: ErrorResponse,
    description: 'Error Response',
  })
  @Put('reset_password')
  async ResetPassword(@Body() resetPassData: ResetPassReqDTO) {
    return this.userVerificationService.resetPassword(resetPassData);
  }
}
