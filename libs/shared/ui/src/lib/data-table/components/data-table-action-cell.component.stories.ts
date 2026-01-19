import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input, OnChanges } from '@angular/core';
import { DataTableActionCellComponent } from './data-table-action-cell.component';
import { createStoryTable, getStoryCellContext } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-data-table-action-cell',
  standalone: true,
  imports: [DataTableActionCellComponent],
  template: `
    <div class="flex items-center justify-center p-6">
      <flex-data-table-action-cell [ctx]="ctx"></flex-data-table-action-cell>
    </div>
  `,
})
class StoryDataTableActionCellComponent implements OnChanges {
  @Input() rowIndex = 0;

  private readonly table = createStoryTable({ enablePagination: false });

  ctx = getStoryCellContext(this.table.instance, 'action', 0);

  ngOnChanges(): void {
    const rows = this.table.instance.getRowModel().rows;
    const clampedIndex = Math.max(0, this.rowIndex);
    const row = rows[clampedIndex] ?? rows[0];
    const resolvedIndex = row ? rows.indexOf(row) : 0;
    this.ctx = getStoryCellContext(this.table.instance, 'action', resolvedIndex);
  }
}

type ActionArgs = {
  rowIndex: number;
};

const meta = {
  component: StoryDataTableActionCellComponent,
  title: 'DataTableActionCellComponent',
} satisfies Meta<ActionArgs>;
export default meta;

type Story = StoryObj<ActionArgs>;

export const Primary: Story = {
  args: {
    rowIndex: 0,
  },
};

export const MenuInteraction: Story = {
  args: {
    rowIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const trigger = canvas.getByRole('button');
    await user.click(trigger);
    // Action menu renders in a portal attached to document.body.
    await expect(screen.getByText('Edit')).toBeTruthy();
  },
};
