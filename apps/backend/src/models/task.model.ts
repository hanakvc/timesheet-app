import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from './page-info.model.js';

export class Task {
  @ApiProperty({ example: 405 })
  id: number;

  @ApiProperty({ type: Number, nullable: true, example: 106 })
  projectId: number | null;

  @ApiProperty({ example: 'Task 2 for Project 106' })
  name: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class TasksPage {
  @ApiProperty({ type: () => [Task] })
  items: Task[];

  @ApiProperty({ type: () => PageInfo })
  page: PageInfo;
}
