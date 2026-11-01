import { ApiProperty } from '@nestjs/swagger';
import { Client } from './client.model.js';
import { Project } from './project.model.js';
import { Task } from './task.model.js';

export class TaskContext {
  @ApiProperty({ type: () => Task })
  task: Task;

  @ApiProperty({ type: () => Project, nullable: true })
  project: Project | null;

  @ApiProperty({ type: () => Client, nullable: true })
  client: Client | null;
}
