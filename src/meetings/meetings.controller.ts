import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findAll(@Req() req: { user: { id: string } }) {
    return this.meetingsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.meetingsService.findOne(req.user.id, id);
  }

  @Post()
  create(@Req() req: { user: { id: string } }, @Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(req.user.id, createMeetingDto);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ) {
    return this.meetingsService.update(req.user.id, id, updateMeetingDto);
  }

  @Patch(':id/transcript')
  updateTranscript(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateTranscriptDto: UpdateTranscriptDto,
  ) {
    return this.meetingsService.updateTranscript(req.user.id, id, updateTranscriptDto);
  }

  @Post(':id/process')
  process(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.meetingsService.process(req.user.id, id);
  }
}
