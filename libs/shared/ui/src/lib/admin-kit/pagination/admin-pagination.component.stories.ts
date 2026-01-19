import type { Meta, StoryObj } from '@storybook/angular';
import { FeAdminPaginationComponent } from './admin-pagination.component';
import { expect } from 'storybook/test';

const meta: Meta<FeAdminPaginationComponent> = {
  component: FeAdminPaginationComponent,
  title: 'FeAdminPaginationComponent',
};
export default meta;

type Story = StoryObj<FeAdminPaginationComponent>;

export const Primary: Story = {
  args: {
    page: 0,
    pageSize: 10,
    total: 0,
  },
};

export const Heading: Story = {
  args: {
    page: 0,
    pageSize: 10,
    total: 0,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/admin-pagination/gi)).toBeTruthy();
  },
};
