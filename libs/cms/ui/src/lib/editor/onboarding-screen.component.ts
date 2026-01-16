import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Template } from '@flex-erp/cms/types';
import { CmsButtonComponent } from '../primitives/button/cms-button.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'cms-onboarding-screen',
  standalone: true,
  imports: [CmsButtonComponent, TranslocoModule],
  templateUrl: './onboarding-screen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsOnboardingScreenComponent {
  @Input() templates: Template[] = [];
  @Output() selectTemplate = new EventEmitter<Template>();

  selectedId: string | null = null;

  setSelected(id: string): void {
    this.selectedId = id;
  }

  start(): void {
    const template = this.templates.find((t) => t.id === this.selectedId);
    if (template) {
      this.selectTemplate.emit(template);
    }
  }

  isSelected(template: Template): boolean {
    return this.selectedId === template.id;
  }

  isClassic(template: Template): boolean {
    return template.id === 'classic';
  }
}
