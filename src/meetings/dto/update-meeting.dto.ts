import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MeetingActionItemDto, MeetingAttendeeDto } from './create-meeting.dto';

export class UpdateMeetingDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingAttendeeDto)
  attendees?: MeetingAttendeeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingActionItemDto)
  actionItems?: MeetingActionItemDto[];

  @IsOptional()
  @IsIn(['idle', 'processing', 'completed', 'failed'])
  status?: string;
}
