import { ApiProperty } from '@nestjs/swagger';

export class FriendActionResDto {
  @ApiProperty({ example: true, description: 'Whether the action was successful' })
  success: boolean;

  @ApiProperty({ example: 'Friend request sent', description: 'Action result message' })
  message: string;
}

export class FriendStatusResDto {
  @ApiProperty({ 
    example: 'friends', 
    enum: ['none', 'pending_sent', 'pending_received', 'friends', 'blocked', 'blocked_by'],
    description: 'The relationship status between the authenticated user and the target user' 
  })
  status: string;
}
