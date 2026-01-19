import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableTableComponent } from './data-table-table.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableTableComponent> = {
  component: DataTableTableComponent,
  title: 'DataTableTableComponent',
};
export default meta;

type Story = StoryObj<DataTableTableComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-table/gi)).toBeTruthy();
  },
};
