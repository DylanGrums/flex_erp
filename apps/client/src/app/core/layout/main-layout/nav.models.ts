export type NavItemType = 'core' | 'extension' | 'setting';

export type NestedNavItem = {
  label: string;
  to: string;
  translationNs?: string;
};

export type NavItem = {
  icon?: string;
  label: string;
  to: string;
  items?: NestedNavItem[];
  type?: NavItemType;
  from?: string;
  nested?: string;
  translationNs?: string;
};
