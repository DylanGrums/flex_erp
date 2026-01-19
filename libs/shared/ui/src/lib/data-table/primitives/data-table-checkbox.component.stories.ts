import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, Input, signal } from '@angular/core';
import {
  DataTableCheckboxComponent,
  DataTableCheckboxState,
} from './data-table-checkbox.component';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-checkbox',
  standalone: true,
  imports: [DataTableCheckboxComponent],
  template: `
    <div class="flex items-center gap-3">
      <flex-data-table-checkbox
        [checked]="checked()"
        [disabled]="disabled"
        (checkedChange)="checked.set($event)"
      ></flex-data-table-checkbox>
      <span data-testid="state">{{ checked() }}</span>
    </div>
  `,
})
class StoryCheckboxComponent {
  @Input() initial: DataTableCheckboxState = false;
  @Input() disabled = false;

  readonly checked = signal<DataTableCheckboxState>(false);

  ngOnInit(): void {
    this.checked.set(this.initial);
  }

  ngOnChanges(): void {
    this.checked.set(this.initial);
  }
}

type CheckboxArgs = {
  initial: DataTableCheckboxState;
  disabled: boolean;
};

const meta = {
  component: StoryCheckboxComponent,
  title: 'DataTableCheckboxComponent',
  decorators: [
    moduleMetadata({
      imports: [StoryCheckboxComponent],
    }),
  ],
} satisfies Meta<CheckboxArgs>;
export default meta;

type Story = StoryObj<CheckboxArgs>;

const renderStory = (args: CheckboxArgs) => ({
  props: args,
  template: `
    <div class="p-4">
      <flex-story-checkbox
        [initial]="initial"
        [disabled]="disabled"
      ></flex-story-checkbox>
    </div>
  `,
});

export const Primary: Story = {
  args: {
    initial: false,
    disabled: false,
  },
  render: renderStory,
};

export const Checked: Story = {
  args: {
    initial: true,
    disabled: false,
  },
  render: renderStory,
};

export const Indeterminate: Story = {
  args: {
    initial: 'indeterminate',
    disabled: false,
  },
  render: renderStory,
};

export const Disabled: Story = {
  args: {
    initial: true,
    disabled: true,
  },
  render: renderStory,
};

export const ToggleInteraction: Story = {
  args: {
    initial: false,
    disabled: false,
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await user.click(canvas.getByRole('button'));
    await expect(canvas.getByTestId('state').textContent).toBe('true');
  },
};
