import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, Input, signal } from '@angular/core';
import { DataTableIconButtonComponent } from './data-table-icon-button.component';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-icon-button',
  standalone: true,
  imports: [DataTableIconButtonComponent],
  template: `
    <div class="flex items-center gap-3">
      <button
        flexDataTableIconButton
        [size]="size"
        [variant]="variant"
        [disabled]="disabled"
        (click)="count.set(count() + 1)"
      >
        <i class="pi pi-ellipsis-h text-sm"></i>
      </button>
      <span data-testid="count">{{ count() }}</span>
    </div>
  `,
})
class StoryIconButtonComponent {
  @Input() size: 'small' | 'base' = 'small';
  @Input() variant: 'default' | 'transparent' = 'default';
  @Input() disabled = false;

  readonly count = signal(0);
}

type IconButtonArgs = {
  size: 'small' | 'base';
  variant: 'default' | 'transparent';
  disabled: boolean;
};

const meta = {
  component: StoryIconButtonComponent,
  title: 'DataTableIconButtonComponent',
  decorators: [
    moduleMetadata({
      imports: [StoryIconButtonComponent],
    }),
  ],
} satisfies Meta<IconButtonArgs>;
export default meta;

type Story = StoryObj<IconButtonArgs>;

const renderStory = (args: IconButtonArgs) => ({
  props: args,
  template: `
    <div class="p-4">
      <flex-story-icon-button
        [size]="size"
        [variant]="variant"
        [disabled]="disabled"
      ></flex-story-icon-button>
    </div>
  `,
});

export const Primary: Story = {
  args: {
    size: 'small',
    variant: 'default',
    disabled: false,
  },
  render: renderStory,
};

export const Transparent: Story = {
  args: {
    size: 'base',
    variant: 'transparent',
    disabled: false,
  },
  render: renderStory,
};

export const Disabled: Story = {
  args: {
    size: 'small',
    variant: 'default',
    disabled: true,
  },
  render: renderStory,
};

export const ClickInteraction: Story = {
  args: {
    size: 'small',
    variant: 'default',
    disabled: false,
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await user.click(canvas.getByRole('button'));
    await expect(canvas.getByTestId('count').textContent).toBe('1');
  },
};
