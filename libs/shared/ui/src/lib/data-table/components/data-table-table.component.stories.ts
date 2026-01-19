import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { DataTableTableComponent } from './data-table-table.component';
import { DataTableEmptyStateProps } from '../types';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-data-table-table',
  standalone: true,
  imports: [DataTableComponent, DataTableTableComponent],
  template: `
    <flex-data-table [instance]="instance" className="min-h-[360px]">
      <flex-data-table-table [emptyState]="emptyState"></flex-data-table-table>
    </flex-data-table>
  `,
})
class StoryDataTableTableComponent {
  @Input() emptyState?: DataTableEmptyStateProps;

  readonly instance = createStoryTable().instance;
}

type TableArgs = {
  emptyState?: DataTableEmptyStateProps;
};

const meta = {
  component: StoryDataTableTableComponent,
  title: 'DataTableTableComponent',
} satisfies Meta<TableArgs>;
export default meta;

type Story = StoryObj<TableArgs>;

export const Primary: Story = {
  args: {
    emptyState: {
      empty: {
        heading: 'No rows yet',
        description: 'Try adding your first entry.',
      },
      filtered: {
        heading: 'No matches',
        description: 'Adjust filters or search terms.',
      },
    },
  },
};

export const WithArgs: Story = {
  args: {
    emptyState: {
      empty: {
        heading: 'Nothing here',
        description: 'Refresh or change filters.',
      },
    },
  },
};

export const SortingInteraction: Story = {
  args: {
    emptyState: {
      empty: {
        heading: 'No rows yet',
        description: 'Try adding your first entry.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const sortButton = canvas.getByRole('button', { name: /name/i });
    await user.click(sortButton);
    const sortIcon = sortButton.querySelector('svg');
    await expect(Boolean(sortIcon?.classList.contains('opacity-100'))).toBe(true);
  },
};
