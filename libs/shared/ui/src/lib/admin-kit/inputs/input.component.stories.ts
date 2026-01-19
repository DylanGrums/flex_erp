import type { Meta, StoryObj } from '@storybook/angular';
import { FeInputComponent } from './input.component';
import { expect } from 'storybook/test';

const meta: Meta<FeInputComponent> = {
  component: FeInputComponent,
  title: 'FeInputComponent',
};
export default meta;

type Story = StoryObj<FeInputComponent>;

export const Primary: Story = {
  args: {
    label: '',
    placeholder: '',
    value: '',
    disabled: false,
    required: false,
    id: '',
    name: '',
    hint: '',
    error: '',
    ariaLabel: '',
    type: 'text',
  },
};

export const Heading: Story = {
  args: {
    label: '',
    placeholder: '',
    value: '',
    disabled: false,
    required: false,
    id: '',
    name: '',
    hint: '',
    error: '',
    ariaLabel: '',
    type: 'text',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/input/gi)).toBeTruthy();
  },
};
