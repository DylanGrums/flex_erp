import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DeviceType, PageType } from '@flex-erp/cms/types';
import { CmsButtonComponent } from '../primitives/button/cms-button.component';
import { CmsInputComponent } from '../primitives/input/cms-input.component';
import { TranslocoModule } from '@jsverse/transloco';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuTriggerDirective,
  FlexTooltipDirective,
  FlexTooltipTriggerDirective,
} from '@flex-erp/shared/ui';
import {
  LucideAngularModule,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Send,
  ChevronDown,
  Check,
  Palette,
  LucideIconData
} from 'lucide-angular';

const PAGES: { value: PageType; label: string }[] = [
  { value: 'home', label: 'cms.editor.pages.home' },
  { value: 'collection', label: 'cms.editor.pages.collection' },
  { value: 'product', label: 'cms.editor.pages.product' },
];

const DEVICES: { value: DeviceType; label: string; icon: LucideIconData }[] = [
  { value: 'desktop', label: 'cms.editor.devices.desktop', icon: Monitor },
  { value: 'tablet', label: 'cms.editor.devices.tablet', icon: Tablet },
  { value: 'mobile', label: 'cms.editor.devices.mobile', icon: Smartphone },
];



@Component({
  selector: 'cms-top-bar',
  standalone: true,
  imports: [
    CmsButtonComponent,
    CmsInputComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexTooltipTriggerDirective,
    FlexTooltipDirective,
    LucideAngularModule,
    TranslocoModule,
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

  public Undo2 = Undo2;
  public Redo2 = Redo2;
  public Save = Save;
  public Send = Send;
  public ChevronDown = ChevronDown;
  public Check = Check;
  public Palette = Palette;

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
