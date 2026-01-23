import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableFilterComponent } from './data-table-filter.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

type FilterArgs = {
  id: string;
  filter: unknown;
  isNew: boolean;
};

const meta = {
  component: DataTableFilterComponent,
  title: 'DataTableFilterComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableFilterComponent],
    }),
  ],
} satisfies Meta<FilterArgs>;
export default meta;

type Story = StoryObj<FilterArgs>;

const renderStory = (args: FilterArgs) => {
  const { instance } = createStoryTable();

  return {
    props: { ...args, instance },
    template: `
      <flex-data-table [instance]="instance">
        <div class="p-4">
          <flex-data-table-filter
            [id]="id"
            [filter]="filter"
            [isNew]="isNew"
          ></flex-data-table-filter>
        </div>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {
    id: 'status',
    filter: 'Active',
    isNew: false,
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    id: 'amount',
    filter: { $gte: 3000 },
    isNew: false,
  },
  render: renderStory,
};

export const FilterInteraction: Story = {
  args: {
    id: 'status',
    filter: 'Active',
    isNew: false,
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const trigger = canvasElement.querySelector('flex-data-table-filter button') as HTMLElement | null;

    if (!trigger) {
      return;
    }

    await user.click(trigger);
    // Filter popover renders in a portal attached to document.body.
    await expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  },
};
