import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableSearchComponent } from './data-table-search.component';
import { DataTableToolbarComponent } from './data-table-toolbar.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

type ToolbarArgs = {
  className: string;
  translations: {
    clearAll?: string;
    sort?: string;
    columns?: string;
  };
};

const meta = {
  component: DataTableToolbarComponent,
  title: 'DataTableToolbarComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableToolbarComponent, DataTableSearchComponent],
    }),
  ],
} satisfies Meta<ToolbarArgs>;
export default meta;

type Story = StoryObj<ToolbarArgs>;

const renderStory = (args: ToolbarArgs) => {
  const { instance } = createStoryTable();

  return {
    props: { ...args, instance },
    template: `
      <flex-data-table [instance]="instance">
        <flex-data-table-toolbar
          [className]="className"
          [translations]="translations"
        >
          <div class="flex items-center gap-3">
            <flex-data-table-search className="w-64"></flex-data-table-search>
            <button
              type="button"
              class="h-8 rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-xs text-ui-fg-base shadow-borders-base transition-fg hover:bg-ui-bg-base-hover"
            >
              Add filter
            </button>
          </div>
        </flex-data-table-toolbar>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {
    className: '',
    translations: {
      clearAll: 'Clear all',
      sort: 'Sort rows',
      columns: 'Columns',
    },
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    className: 'border-b border-ui-border-base',
    translations: {
      clearAll: 'Reset',
      sort: 'Sort by',
      columns: 'Show columns',
    },
  },
  render: renderStory,
};

export const FilterMenuInteraction: Story = {
  args: {
    className: '',
    translations: {
      clearAll: 'Clear all',
      sort: 'Sort rows',
      columns: 'Columns',
    },
  },
  render: renderStory,
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
    await expect(screen.getByText('Status')).toBeTruthy();
  },
};
