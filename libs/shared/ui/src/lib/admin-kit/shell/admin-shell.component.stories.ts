import type { Meta, StoryObj } from '@storybook/angular';
import { FeAdminShellComponent } from './admin-shell.component';
import { expect } from 'storybook/test';

const meta: Meta<FeAdminShellComponent> = {
  component: FeAdminShellComponent,
  title: 'FeAdminShellComponent',
};
export default meta;

type Story = StoryObj<FeAdminShellComponent>;

export const Primary: Story = {
  args: {
    pageTitle: 'admin.dashboard',
  },
};

export const Heading: Story = {
  args: {
    pageTitle: 'admin.dashboard',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/admin-shell/gi)).toBeTruthy();
  },
};
