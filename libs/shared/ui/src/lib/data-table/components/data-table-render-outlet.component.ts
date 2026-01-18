import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';

import { DataTableComponentRenderer, DataTableRender } from '../types';

interface DataTableRenderResult<TContext> {
  template?: TemplateRef<TContext> | null;
  component?: DataTableComponentRenderer<TContext>['component'] | null;
  inputs?: Record<string, unknown> | null;
  text?: string | number | null;
}

@Component({
  selector: 'flex-data-table-render-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (result) {
      @if (result.template) {
        <ng-container *ngTemplateOutlet="result.template; context: context"></ng-container>
      } @else if (result.component) {
        <ng-container *ngComponentOutlet="result.component; inputs: result.inputs ?? undefined"></ng-container>
      } @else {
        {{ result.text ?? '' }}
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableRenderOutletComponent<TContext> {
  @Input({ required: true }) context!: TContext;
  @Input() render?: DataTableRender<TContext> | null;

  get result(): DataTableRenderResult<TContext> | null {
    if (!this.render) {
      const context = this.context as { getValue?: () => unknown };
      if (typeof context?.getValue === 'function') {
        return { text: context.getValue() as string | number | null };
      }

      return { text: '' };
    }

    const value = typeof this.render === 'function' ? this.render(this.context) : this.render;
    return this.resolveValue(value);
  }

  private resolveValue(value: unknown): DataTableRenderResult<TContext> {
    if (value instanceof TemplateRef) {
      return { template: value };
    }

    if (this.isComponentRenderer(value)) {
      return { component: value.component, inputs: value.inputs ?? {} };
    }

    return { text: value as string | number | null };
  }

  private isComponentRenderer(
    value: unknown
  ): value is DataTableComponentRenderer<TContext> {
    return Boolean(
      value && typeof value === 'object' && 'component' in (value as Record<string, unknown>)
    );
  }
}
