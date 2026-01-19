import type { Meta, StoryObj } from '@storybook/angular';
import { FeTextareaComponent } from './textarea.component';
import { expect } from 'storybook/test';

const meta: Meta<FeTextareaComponent> = {
  component: FeTextareaComponent,
  title: 'FeTextareaComponent',
};
export default meta;

type Story = StoryObj<FeTextareaComponent>;

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
    rows: 3,
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
    rows: 3,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/textarea/gi)).toBeTruthy();
  },
};
