export interface User {
    id?: number;
    username: string;
    email: string;
    avatar: string;
    context: string;
    collaborators?: string[];
    created_at?: Date;
    updated_at?: Date;
  }
  