import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableCheckboxComponent } from './data-table-checkbox.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableCheckboxComponent> = {
  component: DataTableCheckboxComponent,
  title: 'DataTableCheckboxComponent',
};
export default meta;

type Story = StoryObj<DataTableCheckboxComponent>;

export const Primary: Story = {
  args: {
    checked: false,
    disabled: false,
    className: '',
  },
};

export const Heading: Story = {
  args: {
    checked: false,
    disabled: false,
    className: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-checkbox/gi)).toBeTruthy();
  },
};
