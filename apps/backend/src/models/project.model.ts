import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from './page-info.model.js';

export class Project {
  @ApiProperty({ example: 106 })
  id: number;

  @ApiProperty({ example: 3 })
  clientId: number;

  @ApiProperty({ example: 'Project 3 for Client 3' })
  name: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class ProjectsPage {
  @ApiProperty({ type: () => [Project] })
  items: Project[];

  @ApiProperty({ type: () => PageInfo })
  page: PageInfo;
}
