import type { Meta, StoryObj } from '@storybook/angular';
import { FlexDividerComponent } from './divider.component';
import { expect } from 'storybook/test';

const meta: Meta<FlexDividerComponent> = {
  component: FlexDividerComponent,
  title: 'FlexDividerComponent',
};
export default meta;

type Story = StoryObj<FlexDividerComponent>;

export const Primary: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    className: '',
  },
};

export const Heading: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    className: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/divider/gi)).toBeTruthy();
  },
};
