import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req, Body, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { AuthGuard } from 'src/middlewares';
import { MediaUsage } from 'models/media/media.schema';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file')) // Frontend must send the file in the 'file' field
    async upload(
        @Req() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|gif|webp|mp4|mov|quicktime)$' }),
                ],
                fileIsRequired: true,
            }),
        ) file: Express.Multer.File,
        @Body('usage') usage: MediaUsage = MediaUsage.POST, // Default to post usage
    ) {
        return this.mediaService.uploadGeneralMedia(file, req.user.id, usage);
    }
}