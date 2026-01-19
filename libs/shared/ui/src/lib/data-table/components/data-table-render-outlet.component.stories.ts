import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableRenderOutletComponent } from './data-table-render-outlet.component';
import { expect, within } from 'storybook/test';

const meta: Meta<DataTableRenderOutletComponent<any>> = {
  component: DataTableRenderOutletComponent,
  title: 'DataTableRenderOutletComponent',
};
export default meta;

type Story = StoryObj<DataTableRenderOutletComponent<any>>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/data-table-render-outlet/gi)).toBeTruthy();
  },
};
