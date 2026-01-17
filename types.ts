
export interface StoryPage {
  id: string;
  imagePrompt: string;
  imageUrl: string;
  caption: string;
  title?: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  style: string;
  pages: StoryPage[];
  createdAt: number;
  updatedAt: number;
}

export type View = 'landing' | 'dashboard' | 'creator' | 'editor' | 'admin' | 'library';

export enum ProjectGenre {
  KIDS = 'Kids',
  HORROR = 'Horror',
  SCIFI = 'Sci-Fi',
  EDUCATION = 'Education',
  FANTASY = 'Fantasy'
}

export enum ArtStyle {
  ANIME = 'Anime',
  COMIC = 'Comic Book',
  REALISTIC = 'Cinematic Realistic',
  WATERCOLOR = 'Watercolor Painting',
  PIXEL = '8-bit Pixel Art'
}
