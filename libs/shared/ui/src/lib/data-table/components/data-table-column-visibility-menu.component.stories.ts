import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableColumnVisibilityMenuComponent } from './data-table-column-visibility-menu.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableColumnVisibilityMenuComponent> = {
  component: DataTableColumnVisibilityMenuComponent,
  title: 'DataTableColumnVisibilityMenuComponent',
};
export default meta;

type Story = StoryObj<DataTableColumnVisibilityMenuComponent>;

export const Primary: Story = {
  args: {
    tooltip: '',
  },
};

export const Heading: Story = {
  args: {
    tooltip: '',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(/data-table-column-visibility-menu/gi),
    ).toBeTruthy();
  },
};
