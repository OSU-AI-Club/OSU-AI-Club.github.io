import { ProjectItem } from '../types';
import { PROJECT_APPLICATION_URL } from './general';

export const PROJECTS: ProjectItem[] = [
  {
    id: 'buckeye-chatbot',
    title: 'O-S-U NavBot NLP Engine',
    category: 'Natural Language Processing',
    description: 'A customized, retrieval-augmented generation (RAG) assistant indexing Ohio State course schedules, building layout directories, and advising options.',
    tags: ['LLM', 'RAG', 'VectorDB', 'TypeScript'],
    stats: '500+ Daily Searches',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd50a?q=80&w=600&auto=format&fit=crop',
    applyUrl: PROJECT_APPLICATION_URL
  },
  {
    id: 'traffic-analysis',
    title: 'Buckeye Vision Traffic AI',
    category: 'Computer Vision',
    description: 'An edge-deployed real-time neural analyzer assessing vehicle counts, safety bottlenecks, and pedestrian lanes around Lane Avenue.',
    tags: ['PyTorch', 'YOLOnas', 'OpenCV', 'Docker'],
    stats: '94.2% Real-time Precision',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    applyUrl: PROJECT_APPLICATION_URL
  },
  {
    id: 'rl-quadcopter',
    title: 'Self-Stabilizing Quadcopter Agent',
    category: 'Robotics & Control',
    description: 'Developing reinforcement learning guidance equations in Pybullet to achieve high-tolerance flight resilience under severe sudden wind gusts.',
    tags: ['Reinforcement Learning', 'PyBullet', 'JAX'],
    stats: '2.4x Recovery Stabilization',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=600&auto=format&fit=crop',
    applyUrl: PROJECT_APPLICATION_URL
  },
  {
    id: 'bio-dna',
    title: 'BioBuckeye DNA Sequence Aligning',
    category: 'Bioinformatics Research',
    description: 'Applying generative sequence models to inspect micro-evolution patterns and classify transcription binding spots with state-of-the-art accuracy.',
    tags: ['DNA-seq', 'Keras', 'Transformers', 'BioPython'],
    stats: 'SOTA Validation Bounds',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=600&auto=format&fit=crop',
    applyUrl: PROJECT_APPLICATION_URL
  }
];
