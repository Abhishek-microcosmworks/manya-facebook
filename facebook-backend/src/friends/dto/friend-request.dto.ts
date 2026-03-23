import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestDto {
    @ApiProperty({
        description: 'The MongoDB ID of the target user',
        example: '65f1a2b3c4d5e6f7a8b9c0d1'
    })
    @IsMongoId({ message: 'Target ID must be a valid MongoDB ObjectId' })
    @IsNotEmpty()
    targetId: string;
}