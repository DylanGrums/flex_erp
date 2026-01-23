import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input, OnChanges } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { DataTableFilterBarComponent } from './data-table-filter-bar.component';
import { DataTableFilteringState } from '../types';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-data-table-filter-bar',
  standalone: true,
  imports: [DataTableComponent, DataTableFilterBarComponent],
  template: `
    <flex-data-table [instance]="instance">
      <flex-data-table-filter-bar
        [clearAllFiltersLabel]="clearAllFiltersLabel"
        [alwaysShow]="alwaysShow"
        [sortingTooltip]="sortingTooltip"
        [columnsTooltip]="columnsTooltip"
      ></flex-data-table-filter-bar>
    </flex-data-table>
  `,
})
class StoryDataTableFilterBarComponent implements OnChanges {
  @Input() clearAllFiltersLabel = 'Clear all';
  @Input() alwaysShow = true;
  @Input() sortingTooltip?: string;
  @Input() columnsTooltip?: string;
  @Input() initialFiltering?: DataTableFilteringState;

  private readonly table = createStoryTable();
  readonly instance = this.table.instance;

  ngOnChanges(): void {
    this.table.state.filtering.set(this.initialFiltering ?? {});
  }
}

type FilterBarArgs = {
  clearAllFiltersLabel: string;
  alwaysShow: boolean;
  sortingTooltip?: string;
  columnsTooltip?: string;
  initialFiltering?: DataTableFilteringState;
};

const meta = {
  component: StoryDataTableFilterBarComponent,
  title: 'DataTableFilterBarComponent',
} satisfies Meta<FilterBarArgs>;
export default meta;

type Story = StoryObj<FilterBarArgs>;

export const Primary: Story = {
  args: {
    clearAllFiltersLabel: 'Clear all',
    alwaysShow: true,
    sortingTooltip: 'Sort',
    columnsTooltip: 'Columns',
  },
};

export const WithArgs: Story = {
  args: {
    clearAllFiltersLabel: 'Reset filters',
    alwaysShow: true,
    sortingTooltip: 'Sort rows',
    columnsTooltip: 'Show columns',
    initialFiltering: { status: 'Active' },
  },
};

export const FilterBarInteraction: Story = {
  args: {
    clearAllFiltersLabel: 'Clear all',
    alwaysShow: true,
    sortingTooltip: 'Sort',
    columnsTooltip: 'Columns',
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = Array.from(
      canvasElement.querySelectorAll('button[flexdatatableiconbutton]')
    ).find((button) => button.querySelector('.pi-filter')) as HTMLElement | undefined;

    if (!trigger) {
      return;
    }

    await user.click(trigger);
    // Filter menu renders in a portal attached to document.body.
    await user.click(screen.getByText('Status'));
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Status')).toBeTruthy();
  },
};
