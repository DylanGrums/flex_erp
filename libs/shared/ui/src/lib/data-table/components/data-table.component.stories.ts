import type { Meta, StoryObj } from '@storybook/angular';
import { Component, Input } from '@angular/core';
import { DataTableComponent } from './data-table.component';
import { DataTableCommandBarComponent } from './data-table-command-bar.component';
import { DataTablePaginationComponent } from './data-table-pagination.component';
import { DataTableSearchComponent } from './data-table-search.component';
import { DataTableTableComponent } from './data-table-table.component';
import { DataTableToolbarComponent } from './data-table-toolbar.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

@Component({
  selector: 'flex-story-data-table',
  standalone: true,
  imports: [
    DataTableComponent,
    DataTableToolbarComponent,
    DataTableSearchComponent,
    DataTableTableComponent,
    DataTablePaginationComponent,
    DataTableCommandBarComponent,
  ],
  template: `
    <flex-data-table [instance]="instance" [className]="className">
      <flex-data-table-toolbar>
        <div class="flex items-center gap-3">
          <flex-data-table-search className="w-64"></flex-data-table-search>
          <button
            type="button"
            class="h-8 rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-xs text-ui-fg-base shadow-borders-base transition-fg hover:bg-ui-bg-base-hover"
          >
            New row
          </button>
        </div>
      </flex-data-table-toolbar>
      <flex-data-table-table></flex-data-table-table>
      <flex-data-table-pagination></flex-data-table-pagination>
      <flex-data-table-command-bar [selectedLabel]="selectedLabel"></flex-data-table-command-bar>
    </flex-data-table>
  `,
})
class StoryDataTableComponent {
  @Input() className = '';

  readonly instance = createStoryTable().instance;
  readonly selectedLabel = (count: number) => `${count} selected`;
}

type DataTableArgs = {
  className: string;
};

const meta = {
  component: StoryDataTableComponent,
  title: 'DataTableComponent',
} satisfies Meta<DataTableArgs>;
export default meta;

type Story = StoryObj<DataTableArgs>;

export const Primary: Story = {
  args: {
    className: 'min-h-[420px]',
  },
};

export const Compact: Story = {
  args: {
    className: 'min-h-[320px]',
  },
};

export const Interactive: Story = {
  args: {
    className: 'min-h-[420px]',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const searchInput = canvas.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Ada');
    await expect((searchInput as HTMLInputElement).value).toBe('Ada');

    const sortButton = canvas.getByRole('button', { name: /name/i });
    await user.click(sortButton);
    const sortIcon = sortButton.querySelector('svg');
    await expect(Boolean(sortIcon?.classList.contains('opacity-100'))).toBe(true);

    const checkboxes = canvasElement.querySelectorAll('button[flexcheckbox]');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1] as HTMLElement);
      await expect(canvas.getByText('Archive')).toBeTruthy();
    }

    const nextButton = canvas.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    await expect(canvas.getByText(/Page 2 of/i)).toBeTruthy();
  },
};
