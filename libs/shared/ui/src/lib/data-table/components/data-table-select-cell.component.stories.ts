import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input, OnChanges } from '@angular/core';
import { DataTableSelectCellComponent } from './data-table-select-cell.component';
import { getStoryCellContext, createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-data-table-select-cell',
  standalone: true,
  imports: [DataTableSelectCellComponent],
  template: `
    <div class="flex items-center gap-3 p-4">
      <flex-data-table-select-cell [ctx]="ctx"></flex-data-table-select-cell>
      <span data-testid="selection-state">
        {{ ctx.row.getIsSelected() ? 'selected' : 'not selected' }}
      </span>
    </div>
  `,
})
class StoryDataTableSelectCellComponent implements OnChanges {
  @Input() selected = false;
  @Input() rowIndex = 0;

  private readonly table = createStoryTable({ enablePagination: false });

  ctx = getStoryCellContext(this.table.instance, 'select', 0);

  ngOnChanges(): void {
    const { instance, state } = this.table;
    const rows = instance.getRowModel().rows;
    const clampedIndex = Math.max(0, this.rowIndex);
    const row = rows[clampedIndex] ?? rows[0];

    if (this.selected && row) {
      state.rowSelection.set({ [row.id]: true });
    } else {
      state.rowSelection.set({});
    }

    const resolvedIndex = row ? rows.indexOf(row) : 0;
    this.ctx = getStoryCellContext(instance, 'select', resolvedIndex);
  }
}

type SelectArgs = {
  selected: boolean;
  rowIndex: number;
};

const meta = {
  component: StoryDataTableSelectCellComponent,
  title: 'DataTableSelectCellComponent',
} satisfies Meta<SelectArgs>;
export default meta;

type Story = StoryObj<SelectArgs>;

export const Primary: Story = {
  args: {
    selected: false,
    rowIndex: 0,
  },
};

export const Checked: Story = {
  args: {
    selected: true,
    rowIndex: 1,
  },
};

export const SelectionInteraction: Story = {
  args: {
    selected: false,
    rowIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const button = canvas.getByRole('button');
    await user.click(button);
    await expect(canvas.getByTestId('selection-state').textContent).toBe('selected');
  },
};
