import { useState, useMemo } from 'react';
import { RotateCcw, ChevronDown, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { sectionDefinitions, mockCollections } from '@/data/mockData';
import { SettingField, Collection } from '@/types/editor';

interface FieldProps {
  field: SettingField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function TextField({ field, value, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{field.label}</Label>
      <Input
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}

function TextareaField({ field, value, onChange }: FieldProps) {
  const text = (value as string) || '';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{field.label}</Label>
        <span className="text-xs text-muted-foreground">{text.length} characters</span>
      </div>
      <Textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        rows={3}
      />
    </div>
  );
}

function ToggleField({ field, value, onChange }: FieldProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <Label className="text-sm">{field.label}</Label>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
      <Switch
        checked={Boolean(value)}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{field.label}</Label>
      <Select value={(value as string) || ''} onValueChange={onChange}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ColorField({ field, value, onChange }: FieldProps) {
  const presetColors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#14B8A6', '#3B82F6', '#1F2937',
    '#FFFFFF', '#F8FAFC',
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm">{field.label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg border cursor-pointer"
          style={{ backgroundColor: (value as string) || '#FFFFFF' }}
        >
          <input
            type="color"
            value={(value as string) || '#FFFFFF'}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 font-mono text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'w-6 h-6 rounded border transition-transform hover:scale-110',
              value === color && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

function RangeField({ field, value, onChange }: FieldProps) {
  const numValue = (value as number) || field.min || 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{field.label}</Label>
        <span className="text-sm font-medium tabular-nums">{numValue}</span>
      </div>
      <Slider
        value={[numValue]}
        onValueChange={([v]) => onChange(v)}
        min={field.min || 0}
        max={field.max || 100}
        step={field.step || 1}
      />
    </div>
  );
}

function ImageField({ field, value, onChange }: FieldProps) {
  const hasImage = Boolean(value);
  
  return (
    <div className="space-y-2">
      <Label className="text-sm">{field.label}</Label>
      {hasImage ? (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
          </div>
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onChange('placeholder-image')}
          className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <ImageIcon className="w-8 h-8" />
          <span className="text-sm">Click to upload</span>
        </button>
      )}
    </div>
  );
}

function CollectionField({ field, value, onChange }: FieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedCollection = mockCollections.find((c) => c.id === value);
  const filteredCollections = mockCollections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label className="text-sm">{field.label}</Label>
      {selectedCollection ? (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedCollection.name}</p>
            <p className="text-xs text-muted-foreground">{selectedCollection.productCount} products</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Select collection
              <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            <Input
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
              {filteredCollections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => {
                    onChange(collection.id);
                    setIsOpen(false);
                  }}
                  className="p-3 bg-muted rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div className="w-full aspect-square bg-muted-foreground/20 rounded-lg mb-2 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm truncate">{collection.name}</p>
                  <p className="text-xs text-muted-foreground">{collection.productCount} products</p>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function SettingFieldRenderer({ field, value, onChange }: FieldProps) {
  switch (field.type) {
    case 'text':
      return <TextField field={field} value={value} onChange={onChange} />;
    case 'textarea':
      return <TextareaField field={field} value={value} onChange={onChange} />;
    case 'toggle':
      return <ToggleField field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} />;
    case 'color':
      return <ColorField field={field} value={value} onChange={onChange} />;
    case 'range':
      return <RangeField field={field} value={value} onChange={onChange} />;
    case 'image':
      return <ImageField field={field} value={value} onChange={onChange} />;
    case 'collection':
      return <CollectionField field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

export function InspectorPanel() {
  const { selectedSection, updateSectionSettings } = useEditor();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Content: true,
    Layout: true,
    Style: true,
  });

  const sectionDef = useMemo(() => {
    if (!selectedSection) return null;
    return sectionDefinitions.find((d) => d.type === selectedSection.type);
  }, [selectedSection]);

  const groupedFields = useMemo(() => {
    if (!sectionDef) return {};
    return sectionDef.settingsSchema.reduce((acc, field) => {
      const group = field.group || 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push(field);
      return acc;
    }, {} as Record<string, SettingField[]>);
  }, [sectionDef]);

  const handleChange = (key: string, value: unknown) => {
    if (selectedSection) {
      updateSectionSettings(selectedSection.id, { [key]: value });
    }
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  if (!selectedSection) {
    return (
      <div className="w-[320px] bg-editor-panel border-l border-editor-border flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <p className="font-medium mb-1">No section selected</p>
            <p className="text-sm">Click on a section in the preview or left panel to edit its settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] bg-editor-panel border-l border-editor-border flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-editor-border">
        <h2 className="text-sm font-semibold text-foreground">{selectedSection.name}</h2>
        <p className="text-xs text-muted-foreground capitalize">{selectedSection.type.replace(/-/g, ' ')}</p>
      </div>

      {/* Settings */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.entries(groupedFields).map(([group, fields]) => (
            <Collapsible
              key={group}
              open={openGroups[group] !== false}
              onOpenChange={() => toggleGroup(group)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                {group}
                {openGroups[group] !== false ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                {fields.map((field) => (
                  <SettingFieldRenderer
                    key={field.key}
                    field={field}
                    value={selectedSection.settings[field.key]}
                    onChange={(value) => handleChange(field.key, value)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-editor-border">
        <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4" />
          Reset Section
        </Button>
      </div>
    </div>
  );
}
