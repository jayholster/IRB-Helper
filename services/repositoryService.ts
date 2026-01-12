
import type { SharedAssignment, AssignmentIdea, CourseLevel } from '../types';

// Mock initial data
const MOCK_DB: SharedAssignment[] = [
  {
    id: '1',
    title: 'Podcast Analysis & critique',
    description: 'Students analyze a discipline-specific podcast episode and record a 5-minute critique focusing on rhetorical strategies.',
    level: '200 (Intermediate)',
    author: 'Dr. Sarah Jenkins',
    tags: ['Oral/Presentation', 'Critical Thinking'],
    date: 'Oct 12, 2023'
  },
  {
    id: '2',
    title: 'Local Ecosystem Field Journal',
    description: 'A semester-long project where students document local biodiversity changes using a digital field journal format.',
    level: '100 (Introductory)',
    author: 'Prof. Mark Alverez',
    tags: ['Multimedia', 'Scientific Literacy'],
    date: 'Nov 05, 2023'
  },
  {
    id: '3',
    title: 'Ethical AI Policy Debate',
    description: 'Teams draft and defend an AI usage policy for a hypothetical corporation, citing ethical frameworks discussed in class.',
    level: '400 (Senior/Capstone)',
    author: 'Dr. Emily Chen',
    tags: ['Group Work', 'Ethics'],
    date: 'Jan 15, 2024'
  }
];

// In-memory store for the session
let currentRepository = [...MOCK_DB];

export const getRepository = async (): Promise<SharedAssignment[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve([...currentRepository]), 600);
  });
};

export const publishAssignment = async (idea: AssignmentIdea, level: CourseLevel): Promise<void> => {
  return new Promise((resolve) => {
    const newAssignment: SharedAssignment = {
      id: Date.now().toString(),
      title: idea.title,
      description: idea.description,
      level: level,
      author: 'Faculty Member (You)',
      tags: ['New', 'Gen Ed'],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    // Add to top
    currentRepository = [newAssignment, ...currentRepository];
    setTimeout(() => resolve(), 800);
  });
};
