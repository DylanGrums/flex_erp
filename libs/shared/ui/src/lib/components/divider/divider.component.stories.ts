import type { Meta, StoryObj } from '@storybook/angular';
import { FlexDividerComponent } from './divider.component';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';

type DividerArgs = {
  orientation: 'horizontal' | 'vertical';
  variant: 'solid' | 'dashed';
  className: string;
};

const meta = {
  component: FlexDividerComponent,
  title: 'FlexDividerComponent',
} satisfies Meta<DividerArgs>;
export default meta;

type Story = StoryObj<DividerArgs>;

const renderStory = (args: DividerArgs) => ({
  props: args,
  template: `
    <div class="p-6">
      <fe-divider
        [orientation]="orientation"
        [variant]="variant"
        [className]="className"
      ></fe-divider>
    </div>
  `,
});

export const Primary: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    className: '',
  },
  render: renderStory,
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    variant: 'dashed',
    className: 'h-24',
  },
  render: renderStory,
};

export const RenderCheck: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    className: '',
  },
  render: renderStory,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('separator')).toBeTruthy();
  },
};
