import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableComponent, EMPTY_DATA_TABLE_INSTANCE } from './data-table.component';
import { expect, within } from 'storybook/test';
import { DataTableInstance } from '../create-data-table';

const meta: Meta<DataTableComponent<any>> = {
  component: DataTableComponent,
  title: 'DataTableComponent',
};
export default meta;

type Story = StoryObj<DataTableComponent<any>>;

export const Primary: Story = {
  args: {
    instance: EMPTY_DATA_TABLE_INSTANCE as DataTableInstance<any>,
    className: '',
  },
};

export const Heading: Story = {
  args: {
    instance: EMPTY_DATA_TABLE_INSTANCE as DataTableInstance<any>,
    className: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/data-table/gi)).toBeTruthy();
  },
};
