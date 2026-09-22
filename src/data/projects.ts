import { ProjectItem } from '../types';
import { PROJECT_APPLICATION_URL } from './general';

// Dead data: the incubator roster is published from the club's Notion board
// (NOTION_SPONSORED_PROJECTS_URL in ./general), not from this array. Kept only as
// a shape reference — populating it renders nothing.
export const PROJECTS: ProjectItem[] = [
  // {
  //   id: 'buckeye-chatbot',
  //   title: 'O-S-U NavBot NLP Engine',
  //   category: 'Natural Language Processing',
  //   description: 'A customized, retrieval-augmented generation (RAG) assistant indexing Ohio State course schedules, building layout directories, and advising options.',
  //   tags: ['LLM', 'RAG', 'VectorDB', 'TypeScript'],
  //   stats: '500+ Daily Searches',
  //   image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd50a?q=80&w=600&auto=format&fit=crop',
  //   applyUrl: PROJECT_APPLICATION_URL
  // },
];
