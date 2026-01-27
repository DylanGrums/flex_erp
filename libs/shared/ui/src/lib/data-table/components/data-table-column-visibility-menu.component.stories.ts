import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableColumnVisibilityMenuComponent } from './data-table-column-visibility-menu.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { screen, userEvent, within } from '@storybook/testing-library';

type ColumnVisibilityArgs = {
  tooltip?: string;
};

const meta = {
  component: DataTableColumnVisibilityMenuComponent,
  title: 'DataTableColumnVisibilityMenuComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableColumnVisibilityMenuComponent],
    }),
  ],
} satisfies Meta<ColumnVisibilityArgs>;
export default meta;

type Story = StoryObj<ColumnVisibilityArgs>;

const renderStory = (args: { tooltip?: string }) => {
  const { instance } = createStoryTable();

  const getVisibleCount = () =>
    instance.getAllColumns().filter((column) => column.getIsVisible()).length;

  return {
    props: { ...args, instance, getVisibleCount },
    template: `
      <flex-data-table [instance]="instance">
        <div class="flex items-center gap-4 p-4">
          <flex-data-table-column-visibility-menu [tooltip]="tooltip"></flex-data-table-column-visibility-menu>
          <span class="text-xs text-ui-fg-muted">Visible: {{ getVisibleCount() }}</span>
        </div>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {
    tooltip: 'Show columns',
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    tooltip: 'Columns',
  },
  render: renderStory,
};

export const VisibilityInteraction: Story = {
  args: {
    tooltip: 'Show columns',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /toggle columns/i });
    const before = canvas.getByText(/Visible:/i).textContent;
    await user.click(trigger);
    // Column visibility menu renders in a portal attached to document.body.
    await user.click(screen.getByText('Email'));
    await expect(canvas.getByText(/Visible:/i).textContent).not.toBe(before);
  },
};
