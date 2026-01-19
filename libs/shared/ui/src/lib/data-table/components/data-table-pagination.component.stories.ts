import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTablePaginationComponent } from './data-table-pagination.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

type PaginationArgs = {
  translations?: {
    results?: (from: number, to: number, total: number) => string;
    page?: (pageIndex: number, pageCount: number) => string;
    previous?: string;
    next?: string;
  };
};

const meta = {
  component: DataTablePaginationComponent,
  title: 'DataTablePaginationComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTablePaginationComponent],
    }),
  ],
} satisfies Meta<PaginationArgs>;
export default meta;

type Story = StoryObj<PaginationArgs>;

const renderStory = (args: PaginationArgs) => {
  const { instance } = createStoryTable();

  return {
    props: { ...args, instance },
    template: `
      <flex-data-table [instance]="instance">
        <flex-data-table-pagination [translations]="translations"></flex-data-table-pagination>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {},
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    translations: {
      results: (from, to, total) => `${from}-${to} of ${total} results`,
      page: (page, count) => `Page ${page} / ${count}`,
    },
  },
  render: renderStory,
};

export const PaginationInteraction: Story = {
  args: {},
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const nextButton = canvas.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    await expect(canvas.getByText(/Page 2/i)).toBeTruthy();
  },
};
