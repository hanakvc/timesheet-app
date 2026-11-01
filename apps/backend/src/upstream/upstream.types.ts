export interface RawClient {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawProject {
  id: number;
  clientId: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawTask {
  id: number;
  projectId?: number;
  parent?: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawTimeEntry {
  id: number;
  taskId: number;
  userId: string;
  comment: string;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpstreamListQuery {
  limit: number;
  offset: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface UpstreamTimeEntryInput {
  taskId: number;
  comment: string;
  start: string;
  end: string;
}
