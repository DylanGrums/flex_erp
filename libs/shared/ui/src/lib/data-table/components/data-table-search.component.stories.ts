import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSearchComponent } from './data-table-search.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableSearchComponent> = {
  component: DataTableSearchComponent,
  title: 'DataTableSearchComponent',
};
export default meta;

type Story = StoryObj<DataTableSearchComponent>;

export const Primary: Story = {
  args: {
    autoFocus: false,
    className: '',
    placeholder: 'Search...',
  },
};

export const Heading: Story = {
  args: {
    autoFocus: false,
    className: '',
    placeholder: 'Search...',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-search/gi)).toBeTruthy();
  },
};
