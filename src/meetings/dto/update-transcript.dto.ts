import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTranscriptDto {
  @IsNotEmpty()
  @IsString()
  transcript!: string;
}
