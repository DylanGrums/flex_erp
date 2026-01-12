import { Injectable } from '@angular/core';
import { NavItem } from './nav.models';

@Injectable({ providedIn: 'root' })
export class ExtensionService {
  getMenu(_key: 'coreExtensions' | 'settingsExtensions'): NavItem[] {
    return [];
  }
}
