import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto.js';

export const TIME_ENTRY_SORT_FIELDS = [
  'id',
  'taskId',
  'start',
  'end',
  'createdAt',
] as const;

export type TimeEntrySortField = (typeof TIME_ENTRY_SORT_FIELDS)[number];

export class TimeEntriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TIME_ENTRY_SORT_FIELDS, default: 'start' })
  @IsOptional()
  @IsIn(TIME_ENTRY_SORT_FIELDS)
  sortBy: TimeEntrySortField = 'start';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
