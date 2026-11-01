import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from './page-info.model.js';

export class TimeEntry {
  @ApiProperty({ example: 4, description: 'Can be 0' })
  id: number;

  @ApiProperty({ example: 405 })
  taskId: number;

  @ApiProperty({ example: 'Reviewed export edge cases' })
  comment: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-30T09:00:00.000Z' })
  start: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-30T10:30:00.000Z' })
  end: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class TimeEntriesPage {
  @ApiProperty({ type: () => [TimeEntry] })
  items: TimeEntry[];

  @ApiProperty({ type: () => PageInfo })
  page: PageInfo;
}
