import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableToolbarComponent } from './data-table-toolbar.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableToolbarComponent> = {
  component: DataTableToolbarComponent,
  title: 'DataTableToolbarComponent',
};
export default meta;

type Story = StoryObj<DataTableToolbarComponent>;

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
    await expect(canvas.getByText(/data-table-toolbar/gi)).toBeTruthy();
  },
};
