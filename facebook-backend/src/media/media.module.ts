import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from 'models/media/media.schema';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
        ThirdPartyModule, // Provides AwsS3Service
        CommonModule,
        AuthModule,
    ],
    controllers: [MediaController],
    providers: [MediaService],
    exports: [MediaService],
})
export class MediaModule { }