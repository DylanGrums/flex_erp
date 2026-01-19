import type { Meta, StoryObj } from '@storybook/angular';
import { FeSelectComponent } from './select.component';
import { expect } from 'storybook/test';

const meta: Meta<FeSelectComponent> = {
  component: FeSelectComponent,
  title: 'FeSelectComponent',
};
export default meta;

type Story = StoryObj<FeSelectComponent>;

export const Primary: Story = {
  args: {
    label: '',
    placeholder: '',
    value: null,
    options: [],
    disabled: false,
    required: false,
    id: '',
    name: '',
    hint: '',
    error: '',
    ariaLabel: '',
  },
};

export const Heading: Story = {
  args: {
    label: '',
    placeholder: '',
    value: null,
    options: [],
    disabled: false,
    required: false,
    id: '',
    name: '',
    hint: '',
    error: '',
    ariaLabel: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/select/gi)).toBeTruthy();
  },
};
