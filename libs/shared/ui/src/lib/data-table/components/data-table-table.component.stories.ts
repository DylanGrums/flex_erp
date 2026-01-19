import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableTableComponent } from './data-table-table.component';
import { expect, within } from 'storybook/test';

const meta: Meta<DataTableTableComponent<any>> = {
  component: DataTableTableComponent,
  title: 'DataTableTableComponent',
};
export default meta;

type Story = StoryObj<DataTableTableComponent<any>>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/data-table-table/gi)).toBeTruthy();
  },
};
