import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { DataTableRender } from '../types';
import { DataTableRenderOutletComponent } from './data-table-render-outlet.component';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-tag',
  standalone: true,
  template: `
    <span class="rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-base">
      {{ label }}
    </span>
  `,
})
class StoryTagComponent {
  @Input() label = '';
}

type RenderContext = {
  label: string;
  getValue?: () => string;
};

@Component({
  selector: 'flex-story-data-table-render-outlet',
  standalone: true,
  imports: [DataTableRenderOutletComponent, StoryTagComponent],
  template: `
    <div class="p-4">
      <flex-data-table-render-outlet
        [context]="context"
        [render]="render"
      ></flex-data-table-render-outlet>
    </div>
  `,
})
class StoryDataTableRenderOutletComponent {
  @Input() context!: RenderContext;
  @Input() render?: DataTableRender<RenderContext> | null;
}

type RenderArgs = {
  context: RenderContext;
  render?: DataTableRender<RenderContext> | null;
};

const meta = {
  component: StoryDataTableRenderOutletComponent,
  title: 'DataTableRenderOutletComponent',
} satisfies Meta<RenderArgs>;
export default meta;

type Story = StoryObj<RenderArgs>;

export const Primary: Story = {
  args: {
    context: {
      label: 'Ada',
      getValue: () => 'Ada Lovelace',
    },
  },
};

export const WithArgs: Story = {
  args: {
    context: {
      label: 'Grace',
    },
    render: (ctx) => `Hello ${ctx.label}`,
  },
};

export const ComponentRender: Story = {
  args: {
    context: {
      label: 'Featured',
    },
    render: () => ({
      component: StoryTagComponent,
      inputs: { label: 'Featured' },
    }),
  },
};

export const RenderCheck: Story = {
  args: {
    context: {
      label: 'Ada',
      getValue: () => 'Ada Lovelace',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ada Lovelace')).toBeTruthy();
  },
};
