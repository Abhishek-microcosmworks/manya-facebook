import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { VerificationToken } from 'models/auth';
import { User } from 'models/user';
import { Model } from 'mongoose';
import { EmailService } from 'src/common/services/email.service';
import { CustomLogger } from 'src/common/services/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ResendVerificationEmailResDTO } from '../credentials-auth-dto/resendVerificationEmail-res.dto';
import { CustomConfigService } from 'src/common/services';
import { Request } from 'express';
import * as argon2 from 'argon2';
import {
  forgotPassReqDTO,
  ResetPassReqDTO,
  ResetPassResDTO,
  forgotPassResDTO,
} from './user-verification-dto';
import { isEmail } from 'validator';

@Injectable()
export class UserVerificationService {
  constructor(
    @InjectModel(VerificationToken.name)
    private readonly VerificationTokenModel: Model<VerificationToken>,

    @InjectModel(User.name)
    private readonly UserModel: Model<User>,

    private readonly logger: CustomLogger,
    private readonly emailService: EmailService,
  ) {
    this.logger.setContext('UserVerification');
  }

  // -------------------------------------------------------------------------------------------------

  private async generateVerificationToken(
    user: User,
  ): Promise<VerificationToken> {
    const registartionToken: string = uuidv4();

    const tokenObj: VerificationToken =
      await this.VerificationTokenModel.create({
        userId: user._id.toString(),
        token: registartionToken,
        expiry: Date.now() + Number(process.env.VERIFICATION_TOKEN_EXPIRY),
      });

    return tokenObj;
  }

  async sendVerificationEmail(user: User, req: Request): Promise<void> {
    try {
      const newVerificationToken = await this.generateVerificationToken(user);

      const { subject, emailBody, fromEmail, EmailVerificationTemplate } =
        CustomConfigService.PROPERTIES.accountVerificationEmail;

      if (newVerificationToken != null) {
        const serverUrl = `${req.protocol}://${req.get('host')}`;

        const verificationLink = `${serverUrl}/api/verify_user/${newVerificationToken.token}`;

        const data = { link: verificationLink };

        const html = EmailVerificationTemplate.replace(
          '$$email',
          user.name || user.email || 'user',
        )
          .replace('$$data.link', data.link)
          .replace('$$timeLeftMessage', '24 Hours')
          .replace(
            '$$message',
            `Thank you for signing up for <strong>Facebook</strong>. <br />
          Please click the button below to verify your email address and
          securely log in.`,
          );

        console.log({ data });

        await this.emailService.sendTextMail({
          fromEmail,
          toEmail: user.email,
          subject,
          textBody: emailBody,
          html,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async resendVerificationEmail(
    user: User,
    req: Request,
  ): Promise<ResendVerificationEmailResDTO> {
    if (user.isEmailVerified) {
      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'Account already verified',
      };
    }

    const userVerificationToken = await this.VerificationTokenModel.findOne({
      userId: user.id,
      isExpired: false,
    });

    if (userVerificationToken && userVerificationToken.expiry >= new Date()) {
      await this.VerificationTokenModel.findOneAndUpdate(
        {
          userId: user.id,
          isExpired: false,
        },
        {
          isExpired: true,
        },
      );
    }

    await this.sendVerificationEmail(user, req);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      msg: 'Verification OTP re-sent successfully!',
    };
  }

  // -------------------------------------------------------------------------------------------------

  async validateVerificationToken(token: string) {
    try {
      const userVerificationToken = await this.VerificationTokenModel.findOne({
        token,
        isExpired: false,
      });

      if (!userVerificationToken) {
        throw new BadRequestException('Token not found !!');
      }

      if (userVerificationToken && userVerificationToken.expiry >= new Date()) {
        await this.VerificationTokenModel.findOneAndUpdate(
          {
            token,
            isExpired: false,
          },
          {
            isExpired: true,
          },
        );

        await this.UserModel.findByIdAndUpdate(
          userVerificationToken.userId.toString(),
          {
            isEmailVerified: true,
            isActive: true,
          },
          {
            runValidators: true,
            new: true,
          },
        );

        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async sendForgotPassEmail(
    forgotPassData: forgotPassReqDTO,
    req: Request,
  ): Promise<forgotPassResDTO> {
    const { email } = forgotPassData;

    try {
      const user = await this.UserModel.findOne({ email });

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      // Check if the user already has a valid token and expire it
      const existingToken = await this.VerificationTokenModel.findOne({
        userId: user.id,
        isExpired: false,
      });

      if (existingToken) {
        await this.VerificationTokenModel.findOneAndUpdate(
          { userId: user.id, isExpired: false },
          { isExpired: true },
        );
      }

      // Generate a new verification token
      const newVerificationToken = await this.generateVerificationToken(user);

      const { subject, emailBody, fromEmail, ForgotPasswordTemplate } =
        CustomConfigService.PROPERTIES.forgotPasswordEmail;

      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const forgotPassLink = `${serverUrl}/api/forget_password/${newVerificationToken.token}`;
      const data = { link: forgotPassLink };

      console.log({ forgotPassLink });

      const html = ForgotPasswordTemplate.replace(
        '$$email',
        user.name || user.email,
      )
        .replace('$$data.link', data.link)
        .replace('$$timeLeftMessage', '24 Hours');

      await this.emailService.sendTextMail({
        fromEmail,
        toEmail: user.email,
        subject,
        textBody: emailBody,
        html,
      });

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'Password reset email sent! Check your inbox for instructions.',
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(newUserData: ResetPassReqDTO): Promise<ResetPassResDTO> {
    try {
      const userVerificationToken = await this.VerificationTokenModel.findOne({
        token: newUserData.token,
      });

      if (!userVerificationToken) {
        throw new BadRequestException('Invalid or expired token');
      }

      const user = await this.UserModel.findById(userVerificationToken.userId);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const hashedPassword = await argon2.hash(newUserData.newPass);

      await this.UserModel.findByIdAndUpdate(
        user._id.toString(),
        {
          password: hashedPassword,
        },
        { runValidators: true, new: true },
      );

      return {
        error: false,
        statusCode: HttpStatus.OK,
        msg: 'User password updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async validateForgotPassToken(token: string) {
    try {
      const userVerificationToken = await this.VerificationTokenModel.findOne({
        token,
        isExpired: false,
      });

      if (!userVerificationToken) {
        throw new BadRequestException('Token not found !!');
      }

      if (userVerificationToken && userVerificationToken.expiry >= new Date()) {
        await this.VerificationTokenModel.findOneAndUpdate(
          {
            token,
            isExpired: false,
          },
          {
            isExpired: true,
          },
        );

        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
