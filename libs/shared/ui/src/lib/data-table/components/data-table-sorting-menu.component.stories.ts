import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableSortingMenuComponent } from './data-table-sorting-menu.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

type SortingMenuArgs = {
  tooltip?: string;
};

const meta = {
  component: DataTableSortingMenuComponent,
  title: 'DataTableSortingMenuComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableSortingMenuComponent],
    }),
  ],
} satisfies Meta<SortingMenuArgs>;
export default meta;

type Story = StoryObj<SortingMenuArgs>;

const renderStory = (args: SortingMenuArgs) => {
  const { instance } = createStoryTable();

  return {
    props: { ...args, instance },
    template: `
      <flex-data-table [instance]="instance">
        <div class="p-4">
          <flex-data-table-sorting-menu [tooltip]="tooltip"></flex-data-table-sorting-menu>
        </div>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {
    tooltip: 'Sort columns',
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    tooltip: 'Sort by',
  },
  render: renderStory,
};

export const SortingInteraction: Story = {
  args: {
    tooltip: 'Sort columns',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const trigger = canvas.getByRole('button');
    await user.click(trigger);
    // Dropdown menu renders in a portal attached to document.body.
    await expect(screen.getByText('Name')).toBeTruthy();
    await user.click(screen.getByText('Name'));
    await user.click(trigger);
    await expect(screen.getByText('A-Z')).toBeTruthy();
  },
};
