import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MeetingAttendeeDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

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
}

export class MeetingActionItemDto {
  @IsNotEmpty()
  @IsString()
  task!: string;

  @IsNotEmpty()
  @IsString()
  assignee!: string;

  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}
