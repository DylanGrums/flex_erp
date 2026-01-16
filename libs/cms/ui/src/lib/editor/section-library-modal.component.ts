import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SectionDefinition } from '@flex-erp/cms/types';
import { CmsButtonComponent } from '../primitives/button/cms-button.component';
import { CmsInputComponent } from '../primitives/input/cms-input.component';
import { CmsScrollAreaComponent } from '../primitives/scroll-area/cms-scroll-area.component';
import { CmsDialogComponent } from '../primitives/dialog/cms-dialog.component';
import { CmsTabsComponent, CmsTabItem } from '../primitives/tabs/cms-tabs.component';
import { TranslocoModule } from '@jsverse/transloco';

const CATEGORIES: CmsTabItem[] = [
  { value: 'all', label: 'cms.editor.categories.all' },
  { value: 'header', label: 'cms.editor.categories.header' },
  { value: 'hero', label: 'cms.editor.categories.hero' },
  { value: 'collections', label: 'cms.editor.categories.collections' },
  { value: 'product', label: 'cms.editor.categories.product' },
  { value: 'marketing', label: 'cms.editor.categories.marketing' },
  { value: 'footer', label: 'cms.editor.categories.footer' },
];

@Component({
  selector: 'cms-section-library-modal',
  standalone: true,
  imports: [
    CmsButtonComponent,
    CmsInputComponent,
    CmsScrollAreaComponent,
    CmsDialogComponent,
    CmsTabsComponent,
    TranslocoModule,
  ],
  templateUrl: './section-library-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class CmsSectionLibraryModalComponent {
  @Input() open = false;
  @Input() sectionDefinitions: SectionDefinition[] = [];

  @Output() requestClose = new EventEmitter<void>();
  @Output() addSection = new EventEmitter<SectionDefinition>();

  search = '';
  activeCategory = 'all';

  get categories() {
    return CATEGORIES;
  }

  filteredSections(): SectionDefinition[] {
    const search = this.search.toLowerCase();
    return this.sectionDefinitions.filter((def) => {
      const matchesSearch =
        def.name.toLowerCase().includes(search) || def.description.toLowerCase().includes(search);
      const matchesCategory = this.activeCategory === 'all' || def.category === this.activeCategory;
      return matchesSearch && matchesCategory;
    });
  }

  iconClass(icon: string): string {
    const map: Record<string, string> = {
      'layout-template': 'pi pi-table',
      image: 'pi pi-image',
      columns: 'pi pi-sliders-h',
      'grid-3x3': 'pi pi-th-large',
      mail: 'pi pi-envelope',
      'panel-bottom': 'pi pi-window-maximize',
      megaphone: 'pi pi-megaphone',
      'credit-card': 'pi pi-credit-card',
      quote: 'pi pi-quote-left',
      'folder-kanban': 'pi pi-sitemap',
    };
    return map[icon] || 'pi pi-table';
  }

  handleAdd(definition: SectionDefinition): void {
    this.addSection.emit(definition);
    this.requestClose.emit();
  }
}
