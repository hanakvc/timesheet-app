import { ApiProperty } from '@nestjs/swagger';

export class PageInfo {
  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({
    description:
      'True when a next page exists (the upstream gives no total count)',
  })
  hasMore: boolean;
}
