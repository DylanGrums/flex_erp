import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSortableHeaderCellComponent } from './data-table-sortable-header-cell.component';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';

type SortableHeaderArgs = {
  id: string;
  className: string;
  style: Record<string, string | number> | null;
  isFirstColumn: boolean;
};

const meta = {
  component: DataTableSortableHeaderCellComponent,
  title: 'DataTableSortableHeaderCellComponent',
} satisfies Meta<SortableHeaderArgs>;
export default meta;

type Story = StoryObj<SortableHeaderArgs>;

const renderStory = (args: SortableHeaderArgs) => ({
  props: args,
  template: `
    <table class="w-full table-fixed border-collapse">
      <thead>
        <tr>
          <flex-data-table-sortable-header-cell
            [id]="id"
            [className]="className"
            [style]="style"
            [isFirstColumn]="isFirstColumn"
          >
            Name
          </flex-data-table-sortable-header-cell>
        </tr>
      </thead>
    </table>
  `,
});

export const Primary: Story = {
  args: {
    id: 'test-header',
    className: 'px-3 py-2',
    style: null,
    isFirstColumn: false,
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    id: 'test-header-heading',
    className: 'px-3 py-2 font-semibold',
    style: { width: '180px' },
    isFirstColumn: true,
  },
  render: renderStory,
};

export const RenderCheck: Story = {
  args: {
    id: 'render-check',
    className: 'px-3 py-2',
    style: null,
    isFirstColumn: false,
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Name')).toBeTruthy();
  },
};
