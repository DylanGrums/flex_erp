import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableRenderOutletComponent } from './data-table-render-outlet.component';
import { expect } from 'storybook/test';

const meta: Meta<DataTableRenderOutletComponent> = {
  component: DataTableRenderOutletComponent,
  title: 'DataTableRenderOutletComponent',
};
export default meta;

type Story = StoryObj<DataTableRenderOutletComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/data-table-render-outlet/gi)).toBeTruthy();
  },
};
