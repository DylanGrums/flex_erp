import { DeviceType, NodeId, PageType, SectionDefinition, Template } from '@flex-erp/cms/types';
import { CmsNodePatch, InspectorTab } from './cms-editor.models';

export class InitFromMock {
  static readonly type = '[CMS Editor] Init From Mock';
  constructor(public template?: Template) { }
}

export class SelectNode {
  static readonly type = '[CMS Editor] Select Node';
  constructor(public nodeId: NodeId | null) { }
}

export class AddSection {
  static readonly type = '[CMS Editor] Add Section';
  constructor(
    public sectionTemplate: SectionDefinition,
    public parentId?: NodeId,
    public index?: number
  ) { }
}

export class RemoveNode {
  static readonly type = '[CMS Editor] Remove Node';
  constructor(public nodeId: NodeId) { }
}

export class UpdateNodeProps {
  static readonly type = '[CMS Editor] Update Node Props';
  constructor(public nodeId: NodeId, public patch: CmsNodePatch) { }
}

export class MoveNode {
  static readonly type = '[CMS Editor] Move Node';
  constructor(public nodeId: NodeId, public targetParentId: NodeId | null, public index: number) { }
}

export class SetViewportMode {
  static readonly type = '[CMS Editor] Set Viewport Mode';
  constructor(public mode: DeviceType) { }
}

export class ToggleInspectorTab {
  static readonly type = '[CMS Editor] Toggle Inspector Tab';
  constructor(public tab: InspectorTab) { }
}

export class OpenSectionLibrary {
  static readonly type = '[CMS Editor] Open Section Library';
}

export class CloseSectionLibrary {
  static readonly type = '[CMS Editor] Close Section Library';
}

export class PublishDraft {
  static readonly type = '[CMS Editor] Publish Draft';
}

export class SaveDraft {
  static readonly type = '[CMS Editor] Save Draft';
}

export class SetStoreName {
  static readonly type = '[CMS Editor] Set Store Name';
  constructor(public name: string) { }
}

export class SetCurrentPage {
  static readonly type = '[CMS Editor] Set Current Page';
  constructor(public page: PageType) { }
}

export class Undo {
  static readonly type = '[CMS Editor] Undo';
}

export class Redo {
  static readonly type = '[CMS Editor] Redo';
}

export class DuplicateNode {
  static readonly type = '[CMS Editor] Duplicate Node';
  constructor(public nodeId: NodeId) { }
}
