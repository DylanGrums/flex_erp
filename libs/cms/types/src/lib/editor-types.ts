export type NodeId = string;

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type PageType = 'home' | 'collection' | 'product';

export type SectionCategory =
  | 'header'
  | 'hero'
  | 'collections'
  | 'product'
  | 'marketing'
  | 'footer';

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

export interface SettingFieldOption {
  label: string;
  value: string;
}

export interface SettingField {
  key: string;
  type:
    | 'text'
    | 'textarea'
    | 'toggle'
    | 'select'
    | 'color'
    | 'range'
    | 'image'
    | 'collection';
  label: string;
  description?: string;
  defaultValue?: unknown;
  options?: SettingFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  group?: string;
}

export interface SectionDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: SectionCategory;
  defaultSettings: Record<string, unknown>;
  settingsSchema: SettingField[];
}

export interface Collection {
  id: string;
  name: string;
  productCount: number;
  image?: string;
}

export interface EditorHistory {
  past: Section[][];
  future: Section[][];
}

export interface CmsTreeNode {
  id: NodeId;
  kind: 'section' | 'block';
  name: string;
  type: string;
  icon?: string;
  visible?: boolean;
  children?: CmsTreeNode[];
}
