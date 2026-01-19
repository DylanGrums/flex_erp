import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableFilterMenuComponent } from './data-table-filter-menu.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

type FilterMenuArgs = {
  tooltip?: string;
};

const meta = {
  component: DataTableFilterMenuComponent,
  title: 'DataTableFilterMenuComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableFilterMenuComponent],
    }),
  ],
} satisfies Meta<FilterMenuArgs>;
export default meta;

type Story = StoryObj<FilterMenuArgs>;

const renderStory = (args: { tooltip?: string }) => {
  const { instance } = createStoryTable();

  return {
    props: { ...args, instance },
    template: `
      <flex-data-table [instance]="instance">
        <div class="p-4">
          <flex-data-table-filter-menu [tooltip]="tooltip"></flex-data-table-filter-menu>
        </div>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {
    tooltip: 'Add filters',
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    tooltip: 'Filters',
  },
  render: renderStory,
};

export const FilterMenuInteraction: Story = {
  args: {
    tooltip: 'Add filters',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const trigger = canvas.getByRole('button');
    await user.click(trigger);
    // Filter menu renders in a portal attached to document.body.
    await expect(screen.getByText('Status')).toBeTruthy();
  },
};
