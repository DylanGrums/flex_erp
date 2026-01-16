import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Collection, Section, SectionDefinition, SettingField } from '@flex-erp/cms/types';
import { CmsButtonComponent } from '../primitives/button/cms-button.component';
import { CmsInputComponent } from '../primitives/input/cms-input.component';
import { CmsTextareaComponent } from '../primitives/textarea/cms-textarea.component';
import { CmsSwitchComponent } from '../primitives/switch/cms-switch.component';
import { CmsSliderComponent } from '../primitives/slider/cms-slider.component';
import { CmsSelectComponent } from '../primitives/select/cms-select.component';
import { CmsScrollAreaComponent } from '../primitives/scroll-area/cms-scroll-area.component';
import { RdxCollapsibleModule } from '@radix-ng/primitives/collapsible';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'cms-inspector-panel',
  standalone: true,
  imports: [
    CmsButtonComponent,
    CmsInputComponent,
    CmsTextareaComponent,
    CmsSwitchComponent,
    CmsSliderComponent,
    CmsSelectComponent,
    CmsScrollAreaComponent,
    RdxCollapsibleModule,
    TranslocoModule,
  ],
  templateUrl: './inspector-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply h-full;
      }
    `,
  ],
})
export class CmsInspectorPanelComponent implements OnChanges {
  @Input() selectedSection: Section | null = null;
  @Input() sectionDefinitions: SectionDefinition[] = [];
  @Input() collections: Collection[] = [];

  @Output() updateSectionSettings = new EventEmitter<{ sectionId: string; key: string; value: unknown }>();

  sectionDefinition: SectionDefinition | null = null;
  groupedFields: Record<string, SettingField[]> = {};
  groupEntries: Array<{ key: string; value: SettingField[] }> = [];
  openGroups: Record<string, boolean> = {
    Content: true,
    Layout: true,
    Style: true,
  };

  collectionOpen = false;
  collectionSearch = '';

  readonly presetColors = [
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#14B8A6',
    '#3B82F6',
    '#1F2937',
    '#FFFFFF',
    '#F8FAFC',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSection'] || changes['sectionDefinitions']) {
      this.sectionDefinition = this.resolveSectionDefinition();
      this.groupedFields = this.groupFields(this.sectionDefinition);
      this.groupEntries = Object.entries(this.groupedFields).map(([key, value]) => ({ key, value }));
    }

    if (changes['selectedSection']) {
      this.collectionOpen = false;
      this.collectionSearch = '';
    }
  }

  resolveSectionDefinition(): SectionDefinition | null {
    if (!this.selectedSection) return null;
    return this.sectionDefinitions.find((def) => def.type === this.selectedSection?.type) ?? null;
  }

  groupFields(definition: SectionDefinition | null): Record<string, SettingField[]> {
    if (!definition) return {};
    return definition.settingsSchema.reduce((acc, field) => {
      const group = field.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, SettingField[]>);
  }

  setGroupOpen(group: string, open: boolean): void {
    this.openGroups[group] = open;
  }

  updateSetting(key: string, value: unknown): void {
    if (!this.selectedSection) return;
    this.updateSectionSettings.emit({
      sectionId: this.selectedSection.id,
      key,
      value,
    });
  }

  onImageSelected(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.updateSetting(key, reader.result as string);
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  toNumber(value: unknown, fallback: number): number {
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  }

  selectedCollection(): Collection | null {
    if (!this.selectedSection) return null;
    const value = this.selectedSection.settings['collection'];
    return this.collections.find((c) => c.id === value) ?? null;
  }

  filteredCollections(): Collection[] {
    const search = this.collectionSearch.toLowerCase();
    return this.collections.filter((collection) => collection.name.toLowerCase().includes(search));
  }

  clearCollection(): void {
    this.updateSetting('collection', null);
  }

  selectCollection(collectionId: string): void {
    this.updateSetting('collection', collectionId);
    this.collectionOpen = false;
  }
}
