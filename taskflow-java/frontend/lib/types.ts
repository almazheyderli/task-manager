export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status   = 'PENDING' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
