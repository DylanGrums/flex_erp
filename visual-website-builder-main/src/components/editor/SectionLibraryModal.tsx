import { useState } from 'react';
import { 
  X, 
  Search,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { sectionDefinitions } from '@/data/mockData';
import { Section, SectionDefinition } from '@/types/editor';

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

const categories = [
  { id: 'all', label: 'All' },
  { id: 'header', label: 'Header' },
  { id: 'hero', label: 'Hero' },
  { id: 'collections', label: 'Collections' },
  { id: 'product', label: 'Product' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'footer', label: 'Footer' },
];

interface SectionLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (section: Section) => void;
}

export function SectionLibraryModal({ open, onClose, onAdd }: SectionLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSections = sectionDefinitions.filter((def) => {
    const matchesSearch = def.name.toLowerCase().includes(search.toLowerCase()) ||
      def.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || def.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (def: SectionDefinition) => {
    const newSection: Section = {
      id: `${def.type}-${Date.now()}`,
      type: def.type,
      name: def.name,
      icon: def.icon,
      visible: true,
      settings: { ...def.defaultSettings },
      blocks: [],
    };
    onAdd(newSection);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold">Add Section</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections Grid */}
        <ScrollArea className="flex-1 max-h-[400px]">
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSections.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p className="font-medium">No sections found</p>
                <p className="text-sm mt-1">Try adjusting your search or category</p>
              </div>
            ) : (
              filteredSections.map((def) => {
                const Icon = iconMap[def.icon] || LayoutTemplate;
                return (
                  <button
                    key={def.type}
                    onClick={() => handleAdd(def)}
                    className="group p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{def.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{def.description}</p>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
