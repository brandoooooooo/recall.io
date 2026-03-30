export type UUID = string;

export interface Identified {
  id: UUID;
}

export interface Deleted {
  deleted: boolean;
}

export interface Resource extends Identified {
  date_created: Date;
  date_updated: Date;
}

export interface STS {
  access_key_id: string;
  secret_access_key: string;
  session_token: string;
  expiration: Date;
}

export interface Collection extends Resource, Deleted {
  name: string;
  user_id: UUID;
  sources: UUID[];
}

export interface Chat extends Resource, Deleted {
  name: string;
  collection_id: UUID;
  user_id: UUID;
  next_seq_num: number;
}

export interface ChatWithMessages extends Chat {
  personality: string;
  chat_messages?: ChatMessage[];
}

export interface ChatMessage extends Resource {
  chat_id: UUID;
  sender?: UUID;
  message: string;
  seq_num: number;
}

export interface Document extends Resource, Deleted {
  file_name: string;
  object_key: string;
  file_size: number;
  content_type: string;
  file_metadata?: object; // maybe change back to JSON
  folder_id: UUID;
  user_id: UUID;
}

// as of now, no document index on frontend

export interface Folder extends Resource, Deleted {
  path: string;
  user_id: UUID;
}

export interface FolderWithDocuments extends Folder {
  // filter: any; // not sure what it is supposed to be change later but works for now
  documents: Document[];
}

// might want to enrich this type with values from Auth0
export interface User extends Resource, Deleted {
  display_name: string;
  email: string;
  accepted_aup?: Date;
}
