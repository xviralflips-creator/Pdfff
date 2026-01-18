
export interface StoryPage {
  id: string;
  imagePrompt: string;
  imageUrl: string;
  caption: string;
  audioUrl?: string;
  videoUrl?: string;
}

export type ProjectType = 'story' | 'video' | 'audio' | 'ebook';

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

export type View = 'landing' | 'dashboard' | 'creator' | 'editor' | 'video-studio' | 'audio-studio' | 'lab' | 'marketplace' | 'admin' | 'library';

export enum ProjectGenre {
  KIDS = 'Kids',
  HORROR = 'Horror',
  SCIFI = 'Sci-Fi',
  EDUCATION = 'Education',
  FANTASY = 'Fantasy',
  CINEMATIC = 'Cinematic'
}

export enum ArtStyle {
  ANIME = 'Anime',
  COMIC = 'Comic Book',
  REALISTIC = 'Cinematic Realistic',
  WATERCOLOR = 'Watercolor Painting',
  PIXEL = '8-bit Pixel Art',
  VEO_CINEMATIC = 'Veo Cinematic'
}
