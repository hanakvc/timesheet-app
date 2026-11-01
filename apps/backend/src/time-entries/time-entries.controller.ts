import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors, ApiErrorBody } from '../common/api-error.js';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { TimeEntriesPage, TimeEntry } from '../models/time-entry.model.js';
import { TimeEntriesQueryDto } from './dto/time-entries-query.dto.js';
import { TimeEntryInputDto } from './dto/time-entry-input.dto.js';
import { TimeEntriesService } from './time-entries.service.js';

@ApiTags('time entries')
@ApiCommonErrors()
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntries: TimeEntriesService) {}

  @Get()
  @ApiOperation({ summary: "A page of the current user's time entries" })
  @ApiOkResponse({ type: TimeEntriesPage })
  listTimeEntries(
    @Query() query: TimeEntriesQueryDto,
  ): Promise<TimeEntriesPage> {
    return this.timeEntries.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a time entry' })
  @ApiCreatedResponse({ type: TimeEntry })
  createTimeEntry(@Body() input: TimeEntryInputDto): Promise<TimeEntry> {
    return this.timeEntries.create(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a time entry (all fields)' })
  @ApiOkResponse({ type: TimeEntry })
  @ApiNotFoundResponse({
    type: ApiErrorBody,
    description: 'No such entry for this user',
  })
  updateTimeEntry(
    @Param('id', ParseIdPipe) id: number,
    @Body() input: TimeEntryInputDto,
  ): Promise<TimeEntry> {
    return this.timeEntries.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a time entry' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({
    type: ApiErrorBody,
    description: 'No such entry for this user',
  })
  deleteTimeEntry(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.timeEntries.remove(id);
  }
}
