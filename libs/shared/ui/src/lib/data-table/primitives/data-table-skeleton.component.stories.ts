import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSkeletonComponent } from './data-table-skeleton.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableSkeletonComponent> = {
  component: DataTableSkeletonComponent,
  title: 'DataTableSkeletonComponent',
};
export default meta;

type Story = StoryObj<DataTableSkeletonComponent>;

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
    await expect(canvas.getByText(/data-table-skeleton/gi)).toBeTruthy();
  },
};
