export interface User {
    id?: number;
    username: string;
    email: string;
    avatar: string;
    context: string;
    collaborator_with?: string;
    created_at?: Date;
    updated_at?: Date;
  }
  