import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableSearchComponent } from './data-table-search.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

type SearchArgs = {
  autoFocus: boolean;
  className: string;
  placeholder: string;
};

const meta = {
  component: DataTableSearchComponent,
  title: 'DataTableSearchComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableSearchComponent],
    }),
  ],
} satisfies Meta<SearchArgs>;
export default meta;

type Story = StoryObj<SearchArgs>;

const renderStory = (args: SearchArgs) => {
  const { instance } = createStoryTable();

  return {
    props: { ...args, instance },
    template: `
      <flex-data-table [instance]="instance">
        <div class="p-4">
          <flex-data-table-search
            [autoFocus]="autoFocus"
            [className]="className"
            [placeholder]="placeholder"
          ></flex-data-table-search>
        </div>
      </flex-data-table>
    `,
  };
};

export const Primary: Story = {
  args: {
    autoFocus: false,
    className: 'w-64',
    placeholder: 'Search...',
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    autoFocus: false,
    className: 'w-80',
    placeholder: 'Search rows',
  },
  render: renderStory,
};

export const TypingInteraction: Story = {
  args: {
    autoFocus: false,
    className: 'w-64',
    placeholder: 'Search...',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const input = canvas.getByPlaceholderText('Search...');
    await user.type(input, 'Grace');
    await expect((input as HTMLInputElement).value).toBe('Grace');
  },
};
