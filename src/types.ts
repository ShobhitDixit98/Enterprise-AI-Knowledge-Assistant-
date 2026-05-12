export interface Book {
  id: string;
  title: string;
  author: string;
  topics: string[];
  content: string;
  score?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Book[];
  timestamp: number;
}
