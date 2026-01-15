import { useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Undo2, 
  Redo2, 
  Save, 
  Rocket,
  ChevronDown,
  Check,
  Palette
} from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { DeviceType, PageType } from '@/types/editor';

const pages: { value: PageType; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'collection', label: 'Collection' },
  { value: 'product', label: 'Product' },
];

const devices: { value: DeviceType; icon: React.ElementType; label: string }[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function TopBar() {
  const { 
    state, 
    setStoreName, 
    setCurrentPage, 
    setDevice, 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    save, 
    publish 
  } = useEditor();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(state.storeName);

  const handleNameSubmit = () => {
    setStoreName(nameValue);
    setIsEditingName(false);
  };

  return (
    <header className="h-14 bg-editor-panel border-b border-editor-border flex items-center px-4 gap-4 shrink-0">
      {/* Left: Logo & Store Name */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Palette className="w-4 h-4 text-primary-foreground" />
        </div>
        
        {isEditingName ? (
          <Input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            className="h-8 w-40 text-sm font-medium"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {state.storeName}
          </button>
        )}
      </div>

      {/* Center: Page Selector */}
      <div className="flex-1 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {pages.find((p) => p.value === state.currentPage)?.label}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-popover">
            {pages.map((page) => (
              <DropdownMenuItem
                key={page.value}
                onClick={() => setCurrentPage(page.value)}
                className="gap-2"
              >
                {page.label}
                {state.currentPage === page.value && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Device Toggles, Undo/Redo, Save/Publish */}
      <div className="flex items-center gap-2 min-w-[200px] justify-end">
        {/* Device Toggles */}
        <div className="flex items-center bg-secondary rounded-lg p-1 gap-0.5">
          {devices.map(({ value, icon: Icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDevice(value)}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    state.device === value
                      ? 'bg-editor-panel text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!canUndo}
              onClick={undo}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!canRedo}
              onClick={redo}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Redo</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Save & Publish */}
        <Button variant="outline" size="sm" onClick={save} className="gap-1.5">
          <Save className="w-4 h-4" />
          Save
        </Button>

        <Button size="sm" onClick={publish} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
          <Rocket className="w-4 h-4" />
          Publish
        </Button>
      </div>
    </header>
  );
}
