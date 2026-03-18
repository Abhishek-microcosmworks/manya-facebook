import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'models/user';
import { Model } from 'mongoose';
import { CustomLogger } from './common/services';
import { ErrorResponse } from './utils/responses';
import { ROLE_VALUES } from 'models/user/user.schema';

interface AdminData {
  EMAIL: string;
  NAME: string;
  PASSWORD: string;
}

@Injectable()
export class BootstrapService {
  constructor(
    private readonly logger: CustomLogger,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  private getAdminData(): AdminData {
    return {
      EMAIL: process.env.APP_ADMIN_MAIL || '',
      NAME: process.env.APP_ADMIN_NAME || '',
      PASSWORD: process.env.APP_ADMIN_PASSWORD || '',
    };
    
  }

  async createAdmin() {
    // await this.resetAppPermissions();

    const { EMAIL, NAME, PASSWORD } = this.getAdminData();
    console.log('Admin Data:', this.getAdminData());

    if (!EMAIL || !NAME || !PASSWORD) {
      const CustomError: ErrorResponse = {
        error: true,
        statusCode: 400,
        message: 'Admin credentials are not fully provided...',
        path: 'bootstrap-service-createAdmin',
        errorId: 1,
        timestamp: new Date(),
      };

      this.logger.error(CustomError);
      return;
    }

    try {
      const user = await this.userModel.findOne({ email: EMAIL });

      if (user == null) {
        await this.userModel.create({
          email: EMAIL,
          name: NAME,
          isEmailVerified: true,
          isAccountCompleted: false,
          password: PASSWORD,
          role: ROLE_VALUES.ADMIN,
          acceptTerms: true,
        });
      }
    } catch (error) {
      console.error('Error saving admin user:', error);
      throw error;
    }
  }

}
