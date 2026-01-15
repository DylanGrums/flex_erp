import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DeviceType, PageType } from '@flex-erp/types';
import { CmsButtonComponent } from '../primitives/button/cms-button.component';
import { CmsInputComponent } from '../primitives/input/cms-input.component';
import {
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective,
  RdxDropdownMenuTriggerDirective,
} from '@radix-ng/primitives/dropdown-menu';
import { RdxTooltipModule } from '@radix-ng/primitives/tooltip';

const PAGES: { value: PageType; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'collection', label: 'Collection' },
  { value: 'product', label: 'Product' },
];

const DEVICES: { value: DeviceType; label: string; icon: string }[] = [
  { value: 'desktop', label: 'Desktop', icon: 'pi pi-desktop' },
  { value: 'tablet', label: 'Tablet', icon: 'pi pi-tablet' },
  { value: 'mobile', label: 'Mobile', icon: 'pi pi-mobile' },
];

@Component({
  selector: 'cms-top-bar',
  standalone: true,
  imports: [
    CmsButtonComponent,
    CmsInputComponent,
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective,
    RdxTooltipModule,
  ],
  templateUrl: './top-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsTopBarComponent {
  @Input() storeName = '';
  @Input() currentPage: PageType = 'home';
  @Input() viewportMode: DeviceType = 'desktop';
  @Input() canUndo = false;
  @Input() canRedo = false;

  @Output() storeNameChange = new EventEmitter<string>();
  @Output() currentPageChange = new EventEmitter<PageType>();
  @Output() viewportModeChange = new EventEmitter<DeviceType>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();

  isEditingName = false;
  nameValue = '';

  get pages() {
    return PAGES;
  }

  get devices() {
    return DEVICES;
  }

  get currentPageLabel(): string {
    return PAGES.find((page) => page.value === this.currentPage)?.label ?? '';
  }

  startEditing(): void {
    this.isEditingName = true;
    this.nameValue = this.storeName;
  }

  submitName(): void {
    this.storeNameChange.emit(this.nameValue.trim() || this.storeName);
    this.isEditingName = false;
  }
}
