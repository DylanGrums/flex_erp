import { useState } from 'react';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  ChevronRight, 
  Plus,
  LayoutTemplate,
  Image,
  Columns,
  Grid3X3,
  Mail,
  PanelBottom,
  Megaphone,
  CreditCard,
  Quote,
  FolderKanban
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Section, Block } from '@/types/editor';

const iconMap: Record<string, React.ElementType> = {
  'layout-template': LayoutTemplate,
  'image': Image,
  'columns': Columns,
  'grid-3x3': Grid3X3,
  'mail': Mail,
  'panel-bottom': PanelBottom,
  'megaphone': Megaphone,
  'credit-card': CreditCard,
  'quote': Quote,
  'folder-kanban': FolderKanban,
};

interface SectionItemProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  index: number;
  isDragOver: boolean;
}

function SectionItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  index,
  isDragOver,
}: SectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const Icon = iconMap[section.icon] || LayoutTemplate;

  const hasBlocks = section.blocks.length > 0;

  return (
    <>
      <div
        className={cn(
          'relative',
          isDragOver && 'before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary before:z-10'
        )}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      >
        <div
          className={cn(
            'group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-2',
            isSelected
              ? 'bg-editor-selected border-l-editor-selected-border'
              : 'border-l-transparent hover:bg-editor-hover',
            !section.visible && 'opacity-50'
          )}
          onClick={onSelect}
          draggable
          onDragStart={(e) => onDragStart(e, index)}
        >
          {/* Drag Handle */}
          <button
            className="p-0.5 -ml-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Expand Arrow (if has blocks) */}
          {hasBlocks ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight
                className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')}
              />
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Icon */}
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />

          {/* Name */}
          <span className="text-sm font-medium truncate flex-1">{section.name}</span>

          {/* Hover Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nested Blocks */}
        {hasBlocks && isExpanded && (
          <div className="ml-8 border-l border-editor-border">
            {section.blocks.map((block) => (
              <BlockItem key={block.id} block={block} sectionId={section.id} />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{section.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BlockItem({ block, sectionId }: { block: Block; sectionId: string }) {
  const { state, selectSection } = useEditor();
  const isSelected = state.selectedSectionId === sectionId && state.selectedBlockId === block.id;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-l-2',
        isSelected
          ? 'bg-editor-selected border-l-editor-selected-border'
          : 'border-l-transparent hover:bg-editor-hover'
      )}
      onClick={() => selectSection(sectionId, block.id)}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      <span className="text-sm text-muted-foreground">{block.name}</span>
    </div>
  );
}

interface SectionsTreeProps {
  onAddSection: () => void;
}

export function SectionsTree({ onAddSection }: SectionsTreeProps) {
  const { state, selectSection, toggleSectionVisibility, duplicateSection, deleteSection, reorderSections } = useEditor();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex !== targetIndex) {
      reorderSections(sourceIndex, targetIndex);
    }
    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  return (
    <div className="w-[280px] bg-editor-panel border-r border-editor-border flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-editor-border">
        <h2 className="text-sm font-semibold text-foreground">Sections</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder</p>
      </div>

      {/* Sections List */}
      <ScrollArea className="flex-1">
        <div className="py-2" onDragEnd={handleDragEnd}>
          {state.sections.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No sections yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click below to add your first section</p>
            </div>
          ) : (
            state.sections.map((section, index) => (
              <div
                key={section.id}
                onDragEnter={() => handleDragEnter(index)}
              >
                <SectionItem
                  section={section}
                  isSelected={state.selectedSectionId === section.id}
                  onSelect={() => selectSection(section.id)}
                  onToggleVisibility={() => toggleSectionVisibility(section.id)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onDelete={() => deleteSection(section.id)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  index={index}
                  isDragOver={dragOverIndex === index}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Section Button */}
      <div className="p-4 border-t border-editor-border">
        <Button onClick={onAddSection} variant="outline" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>
    </div>
  );
}
