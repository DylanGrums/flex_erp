import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableSkeletonComponent } from './data-table-skeleton.component';
import { expect } from '@storybook/jest';

type SkeletonArgs = {
  className: string;
};

const meta = {
  component: DataTableSkeletonComponent,
  title: 'DataTableSkeletonComponent',
} satisfies Meta<SkeletonArgs>;
export default meta;

type Story = StoryObj<SkeletonArgs>;

const renderStory = (args: SkeletonArgs) => ({
  props: args,
  template: `
    <div class="p-4">
      <flex-data-table-skeleton [className]="className"></flex-data-table-skeleton>
    </div>
  `,
});

export const Primary: Story = {
  args: {
    className: 'h-8 w-48',
  },
  render: renderStory,
};

export const Wide: Story = {
  args: {
    className: 'h-10 w-full',
  },
  render: renderStory,
};

export const RenderCheck: Story = {
  args: {
    className: 'h-8 w-48',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    await expect(Boolean(canvasElement.querySelector('flex-data-table-skeleton'))).toBe(true);
  },
};
