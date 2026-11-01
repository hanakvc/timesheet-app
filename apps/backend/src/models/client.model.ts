import { ApiProperty } from '@nestjs/swagger';
import { PageInfo } from './page-info.model.js';

export class Client {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Client 3' })
  name: string;

  @ApiProperty({ example: 'This is the description for client 3.' })
  description: string;

  @ApiProperty({
    example: 'in-progress',
    description: 'in-progress, pending or completed',
  })
  status: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class ClientsPage {
  @ApiProperty({ type: () => [Client] })
  items: Client[];

  @ApiProperty({ type: () => PageInfo })
  page: PageInfo;
}
