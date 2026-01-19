import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataTableComponent } from './data-table.component';
import { DataTableCommandBarComponent } from './data-table-command-bar.component';
import { createStoryTable } from '../storybook/data-table-story-helpers';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

type CommandArgs = {
  className: string;
  selectedLabel?: string | ((count: number) => string);
};

const meta = {
  component: DataTableCommandBarComponent,
  title: 'DataTableCommandBarComponent',
  decorators: [
    moduleMetadata({
      imports: [DataTableComponent, DataTableCommandBarComponent],
    }),
  ],
} satisfies Meta<CommandArgs>;
export default meta;

type Story = StoryObj<CommandArgs>;

const renderStory = (args: CommandArgs) => {
  const { instance } = createStoryTable({ enablePagination: false });
  const toggleSelection = () => {
    const row = instance.getRowModel().rows[0];
    row?.toggleSelected();
  };

  return {
    props: {
      ...args,
      instance,
      toggleSelection,
      selectedLabel: args.selectedLabel ?? ((count: number) => `${count} selected`),
    },
    template: `
      <div class="p-4">
        <button
          type="button"
          class="mb-4 h-8 rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-xs text-ui-fg-base shadow-borders-base transition-fg hover:bg-ui-bg-base-hover"
          (click)="toggleSelection()"
        >
          Toggle selection
        </button>
        <flex-data-table [instance]="instance">
          <flex-data-table-command-bar
            [className]="className"
            [selectedLabel]="selectedLabel"
          ></flex-data-table-command-bar>
        </flex-data-table>
      </div>
    `,
  };
};

export const Primary: Story = {
  args: {
    className: '',
  },
  render: renderStory,
};

export const WithArgs: Story = {
  args: {
    className: 'max-w-md',
    selectedLabel: 'Selected rows',
  },
  render: renderStory,
};

export const CommandBarInteraction: Story = {
  args: {
    className: '',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const toggle = canvas.getByRole('button', { name: /toggle selection/i });
    await user.click(toggle);
    await expect(canvas.getByText('Archive')).toBeTruthy();
  },
};
