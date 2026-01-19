import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableCommandBarComponent } from './data-table-command-bar.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableCommandBarComponent> = {
  component: DataTableCommandBarComponent,
  title: 'DataTableCommandBarComponent',
};
export default meta;

type Story = StoryObj<DataTableCommandBarComponent>;

export const Primary: Story = {
  args: {
    className: '',
  },
};

export const Heading: Story = {
  args: {
    className: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-command-bar/gi)).toBeTruthy();
  },
};
