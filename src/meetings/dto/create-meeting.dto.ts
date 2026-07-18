import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
