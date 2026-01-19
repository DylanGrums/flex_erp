import type { Meta, StoryObj } from '@storybook/angular';
import { FeAdminTableComponent } from './admin-table.component';
import { expect } from 'storybook/test';

const meta: Meta<FeAdminTableComponent> = {
  component: FeAdminTableComponent,
  title: 'FeAdminTableComponent',
};
export default meta;

type Story = StoryObj<FeAdminTableComponent>;

export const Primary: Story = {
  args: {
    columns: [],
    rows: [],
    loading: false,
    rowActions: [],
    page: 0,
    pageSize: 0,
    rowKey: '',
  },
};

export const Heading: Story = {
  args: {
    columns: [],
    rows: [],
    loading: false,
    rowActions: [],
    page: 0,
    pageSize: 0,
    rowKey: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/admin-table/gi)).toBeTruthy();
  },
};
