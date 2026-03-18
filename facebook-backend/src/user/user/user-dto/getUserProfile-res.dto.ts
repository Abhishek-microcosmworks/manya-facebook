import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';
import { UserProfileDto } from './userProfile.dto';

export class GetUserProfileResDTO extends BaseResponse {
  @ApiProperty({
    type: UserProfileDto,
  })
  user: UserProfileDto;
}