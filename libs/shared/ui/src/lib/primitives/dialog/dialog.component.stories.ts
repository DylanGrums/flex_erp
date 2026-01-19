import type { Meta, StoryObj } from '@storybook/angular';
import { FlexDialogComponent } from './dialog.component';
import { expect } from '@storybook/jest';
import { screen } from '@storybook/testing-library';

const meta = {
  component: FlexDialogComponent,
  title: 'FlexDialogComponent',
} satisfies Meta<DialogArgs>;
export default meta;

type Story = StoryObj<DialogArgs>;

type DialogArgs = {
  open: boolean;
  modal: boolean;
  mode: 'default' | 'sheet' | 'sheet-bottom' | 'sheet-top' | 'sheet-left' | 'sheet-right';
  contentClass: string;
  panelClasses: string[];
  backdropClass: string | string[];
};

const renderStory = (args: DialogArgs) => ({
  props: args,
  template: `
    <flex-dialog
      [open]="open"
      [modal]="modal"
      [mode]="mode"
      [contentClass]="contentClass"
      [panelClasses]="panelClasses"
      [backdropClass]="backdropClass"
    >
      <div class="p-6 text-sm text-ui-fg-base">
        Dialog content
      </div>
    </flex-dialog>
  `,
});

export const Primary: Story = {
  args: {
    open: true,
    modal: true,
    mode: 'default',
    contentClass:
      'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg',
    panelClasses: [],
    backdropClass: 'bg-black/40',
  },
  render: renderStory,
};

export const SheetRight: Story = {
  args: {
    open: true,
    modal: true,
    mode: 'sheet-right',
    contentClass:
      'w-full max-w-md h-full overflow-hidden border border-ui-border-base bg-ui-bg-base shadow-lg',
    panelClasses: [],
    backdropClass: 'bg-black/40',
  },
  render: renderStory,
};

export const RenderCheck: Story = {
  args: {
    open: true,
    modal: true,
    mode: 'default',
    contentClass:
      'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg',
    panelClasses: [],
    backdropClass: 'bg-black/40',
  },
  render: renderStory,
  play: async () => {
    // Dialog content renders in a portal attached to document.body.
    await expect(screen.getByText('Dialog content')).toBeTruthy();
  },
};
