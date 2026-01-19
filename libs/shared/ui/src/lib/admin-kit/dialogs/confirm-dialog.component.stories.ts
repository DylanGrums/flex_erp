import type { Meta, StoryObj } from '@storybook/angular';
import { FeConfirmDialogComponent } from './confirm-dialog.component';
import { expect } from 'storybook/test';

const meta: Meta<FeConfirmDialogComponent> = {
  component: FeConfirmDialogComponent,
  title: 'FeConfirmDialogComponent',
};
export default meta;

type Story = StoryObj<FeConfirmDialogComponent>;

export const Primary: Story = {
  args: {
    open: false,
    title: 'common.confirmTitle',
    description: 'common.confirmDescription',
    confirmText: 'common.delete',
    cancelText: 'common.cancel',
    severity: 'danger',
  },
};

export const Heading: Story = {
  args: {
    open: false,
    title: 'common.confirmTitle',
    description: 'common.confirmDescription',
    confirmText: 'common.delete',
    cancelText: 'common.cancel',
    severity: 'danger',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/confirm-dialog/gi)).toBeTruthy();
  },
};
