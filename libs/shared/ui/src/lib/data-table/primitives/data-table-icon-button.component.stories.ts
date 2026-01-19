import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableIconButtonComponent } from './data-table-icon-button.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableIconButtonComponent> = {
  component: DataTableIconButtonComponent,
  title: 'DataTableIconButtonComponent',
};
export default meta;

type Story = StoryObj<DataTableIconButtonComponent>;

export const Primary: Story = {
  args: {
    size: 'small',
    variant: 'default',
    disabled: false,
    className: '',
  },
};

export const Heading: Story = {
  args: {
    size: 'small',
    variant: 'default',
    disabled: false,
    className: '',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-icon-button/gi)).toBeTruthy();
  },
};
