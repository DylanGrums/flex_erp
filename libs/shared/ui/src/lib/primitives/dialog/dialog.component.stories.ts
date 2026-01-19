import type { Meta, StoryObj } from '@storybook/angular';
import { FlexDialogComponent } from './dialog.component';
import { expect } from 'storybook/test';

const meta: Meta<FlexDialogComponent> = {
  component: FlexDialogComponent,
  title: 'FlexDialogComponent',
};
export default meta;

type Story = StoryObj<FlexDialogComponent>;

export const Primary: Story = {
  args: {
    open: false,
    modal: true,
    mode: 'default',
    contentClass:
      'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg',
    panelClasses: [],
    backdropClass: 'bg-black/40',
  },
};

export const Heading: Story = {
  args: {
    open: false,
    modal: true,
    mode: 'default',
    contentClass:
      'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg',
    panelClasses: [],
    backdropClass: 'bg-black/40',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/dialog/gi)).toBeTruthy();
  },
};
