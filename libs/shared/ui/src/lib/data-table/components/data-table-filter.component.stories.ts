import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableFilterSelectContentComponent } from './data-table-filter.component';
import { expect, within } from 'storybook/test';

const meta: Meta<DataTableFilterSelectContentComponent> = {
  component: DataTableFilterSelectContentComponent,
  title: 'DataTableFilterSelectContentComponent',
};
export default meta;

type Story = StoryObj<DataTableFilterSelectContentComponent>;

export const Primary: Story = {
  args: {
    id: 'test-filter-id',
    filter: [],
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ],
  },
};

export const Heading: Story = {
  args: {
    id: 'test-filter-id-heading',
    filter: ['opt1'],
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Option 1/gi)).toBeTruthy();
  },
};
