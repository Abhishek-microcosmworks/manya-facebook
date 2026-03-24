import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaUsage } from 'models/media/media.schema';
import { AwsS3Service } from 'src/third-party/aws/s3.service';

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media.name) private mediaModel: Model<Media>,
        private readonly s3Service: AwsS3Service,
    ) { }

    async uploadGeneralMedia(file: Express.Multer.File, userId: string, usage: MediaUsage) {
        // 1. Physical upload to S3
        const { Location } = await this.s3Service.uploadFile(file);

        // 2. Identify media type (production-grade detection)
        const type = file.mimetype.startsWith('video') ? 'video' :
            file.mimetype.includes('gif') ? 'gif' : 'image';

        // 3. Create metadata record in MongoDB
        return this.mediaModel.create({
            url: Location,
            owner_id: userId,
            type,
            usage,
            size: file.size,
        });
    }
}