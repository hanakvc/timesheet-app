import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors, ApiErrorBody } from '../common/api-error.js';
import { PaginationQueryDto } from '../common/pagination.dto.js';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { ClientsPage } from '../models/client.model.js';
import { ProjectsPage } from '../models/project.model.js';
import { TaskContext } from '../models/task-context.model.js';
import { TasksPage } from '../models/task.model.js';
import { CatalogService } from './catalog.service.js';

@ApiTags('catalog')
@ApiCommonErrors()
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('clients')
  @ApiOperation({ summary: 'A page of clients' })
  @ApiOkResponse({ type: ClientsPage })
  listClients(@Query() query: PaginationQueryDto): Promise<ClientsPage> {
    return this.catalog.listClients(query);
  }

  @Get('clients/:id/projects')
  @ApiOperation({ summary: "A page of a client's projects" })
  @ApiOkResponse({ type: ProjectsPage })
  listProjects(
    @Param('id', ParseIdPipe) clientId: number,
    @Query() query: PaginationQueryDto,
  ): Promise<ProjectsPage> {
    return this.catalog.listProjects(clientId, query);
  }

  @Get('projects/:id/tasks')
  @ApiOperation({ summary: "A page of a project's tasks" })
  @ApiOkResponse({ type: TasksPage })
  listTasks(
    @Param('id', ParseIdPipe) projectId: number,
    @Query() query: PaginationQueryDto,
  ): Promise<TasksPage> {
    return this.catalog.listTasks(projectId, query);
  }

  @Get('tasks/:id/context')
  @ApiOperation({ summary: 'A task with the project and client it belongs to' })
  @ApiOkResponse({ type: TaskContext })
  @ApiNotFoundResponse({ type: ApiErrorBody, description: 'No such task' })
  getTaskContext(
    @Param('id', ParseIdPipe) taskId: number,
  ): Promise<TaskContext> {
    return this.catalog.getTaskContext(taskId);
  }
}
