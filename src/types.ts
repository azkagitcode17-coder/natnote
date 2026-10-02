export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type NoteColorTone = 'default' | 'cream' | 'tosca-light' | 'sand' | 'sage' | 'clay';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  isLocked: boolean;
  pinCode?: string;
  colorTone?: NoteColorTone;
  checklists?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  count?: number;
}

export type ViewFilter = 'all' | 'favorites' | 'checklists' | 'locked' | 'trash';
export type SortOption = 'updated-desc' | 'updated-asc' | 'created-desc' | 'title-asc';
export type ViewMode = 'grid' | 'list';
