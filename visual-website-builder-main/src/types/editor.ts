// Editor Types

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type PageType = 'home' | 'collection' | 'product';

export interface Block {
  id: string;
  type: string;
  name: string;
  settings: Record<string, unknown>;
}

export interface Section {
  id: string;
  type: string;
  name: string;
  icon: string;
  visible: boolean;
  settings: Record<string, unknown>;
  blocks: Block[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: Section[];
  thumbnail?: string;
}

export interface SectionDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'header' | 'hero' | 'collections' | 'product' | 'marketing' | 'footer';
  defaultSettings: Record<string, unknown>;
  settingsSchema: SettingField[];
}

export interface SettingField {
  key: string;
  type: 'text' | 'textarea' | 'toggle' | 'select' | 'color' | 'range' | 'image' | 'collection';
  label: string;
  description?: string;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  group?: string;
}

export interface Collection {
  id: string;
  name: string;
  productCount: number;
  image?: string;
}

export interface EditorState {
  storeName: string;
  currentPage: PageType;
  device: DeviceType;
  sections: Section[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  isDirty: boolean;
  history: {
    past: Section[][];
    future: Section[][];
  };
}
