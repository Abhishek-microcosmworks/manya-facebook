import { Module } from '@nestjs/common';
import {
  CustomConfigService,
  CustomLogger,
  EmailService,
  UtilsService,
} from './services';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ThirdPartyModule, ConfigModule],
  providers: [EmailService, CustomLogger, CustomConfigService, UtilsService],
  exports: [EmailService, CustomLogger, CustomConfigService, UtilsService],
})
export class CommonModule {}
