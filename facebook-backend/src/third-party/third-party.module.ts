import { Module } from '@nestjs/common';
import { AwsS3Service, AwsSesService } from './aws';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AwsSesService, AwsS3Service],
  exports: [AwsSesService, AwsS3Service],
})
export class ThirdPartyModule {}
