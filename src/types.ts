
export interface StoryPage {
  id: string;
  imagePrompt: string;
  imageUrl: string;
  caption: string;
  audioUrl?: string;
  videoUrl?: string;
}

export type ProjectType = 'story' | 'video' | 'audio' | 'ebook' | 'ad';

export interface Project {
  id: string;
  title: string;
  genre: string;
  style: string;
  type: ProjectType;
  pages: StoryPage[];
  createdAt: number;
  updatedAt: number;
  isPublished?: boolean;
  price?: number;
}

export interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  createdAt: number;
}

export interface Subscription {
  tier: 'free' | 'pro' | 'elite';
  expiresAt?: number;
}

export type View = 'landing' | 'dashboard' | 'creator' | 'editor' | 'video-studio' | 'audio-studio' | 'lab' | 'marketplace' | 'admin' | 'library' | 'store' | 'ads-gen' | 'character-forge';

export enum ProjectGenre {
  KIDS = 'Kids',
  HORROR = 'Horror',
  SCIFI = 'Sci-Fi',
  EDUCATION = 'Education',
  FANTASY = 'Fantasy',
  CINEMATIC = 'Cinematic',
  MARKETING = 'Marketing'
}

export enum ArtStyle {
  ANIME = 'Anime',
  COMIC = 'Comic Book',
  REALISTIC = 'Cinematic Realistic',
  WATERCOLOR = 'Watercolor Painting',
  PIXEL = '8-bit Pixel Art',
  VEO_CINEMATIC = 'Veo Cinematic',
  UGC_AD = 'Authentic UGC'
}

// Workspace Types
export interface FileDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  storagePath: string;
  downloadURL: string;
  folderId?: string;
  createdAt: any; // Firestore Timestamp
}

export interface FolderDoc {
  id: string;
  name: string;
  createdAt: any;
}

export interface NoteDoc {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export interface TeamMemberDoc {
  id: string;
  name: string;
  role: string;
  createdAt: any;
}
