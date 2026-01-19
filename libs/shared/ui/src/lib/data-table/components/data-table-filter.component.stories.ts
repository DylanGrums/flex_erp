import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableFilterSelectContentComponent } from './data-table-filter.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableFilterSelectContentComponent> = {
  component: DataTableFilterSelectContentComponent,
  title: 'DataTableFilterSelectContentComponent',
};
export default meta;

type Story = StoryObj<DataTableFilterSelectContentComponent>;

export const Primary: Story = {
  args: {
    id: '',
    filter: [],
    options: [],
    id: '',
    options: [],
    id: '',
    options: [],
    format: 'date',
    rangeOptionLabel: '',
    rangeOptionStartLabel: '',
    rangeOptionEndLabel: '',
    disableRangeOption: false,
    isCustomRange: false,
    id: '',
    filter: [],
    options: [],
    searchable: true,
    id: '',
    placeholder: 'Enter value...',
    id: '',
    placeholder: 'Enter number...',
    includeOperators: true,
    id: '',
    isNew: false,
  },
};

export const Heading: Story = {
  args: {
    id: '',
    filter: [],
    options: [],
    id: '',
    options: [],
    id: '',
    options: [],
    format: 'date',
    rangeOptionLabel: '',
    rangeOptionStartLabel: '',
    rangeOptionEndLabel: '',
    disableRangeOption: false,
    isCustomRange: false,
    id: '',
    filter: [],
    options: [],
    searchable: true,
    id: '',
    placeholder: 'Enter value...',
    id: '',
    placeholder: 'Enter number...',
    includeOperators: true,
    id: '',
    isNew: false,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-filter/gi)).toBeTruthy();
  },
};
