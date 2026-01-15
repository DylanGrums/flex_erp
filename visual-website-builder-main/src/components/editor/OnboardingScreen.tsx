import { useState } from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { templates } from '@/data/mockData';
import { Template } from '@/types/editor';

interface OnboardingScreenProps {
  onSelectTemplate: (template: Template) => void;
}

export function OnboardingScreen({ onSelectTemplate }: OnboardingScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleStart = () => {
    const template = templates.find((t) => t.id === selectedId);
    if (template) {
      onSelectTemplate(template);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start Building Your Store
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Choose Your Starting Template
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Select a template that best matches your vision. You can customize everything later.
          </p>
        </div>

        {/* Template Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {templates.map((template) => {
            const isSelected = selectedId === template.id;
            const isClassic = template.id === 'classic';
            
            return (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                className={cn(
                  'relative p-6 rounded-2xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                )}
              >
                {/* Selection Indicator */}
                <div
                  className={cn(
                    'absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground scale-100'
                      : 'bg-muted scale-90'
                  )}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>

                {/* Mock Preview */}
                <div className="aspect-[4/3] bg-muted rounded-lg mb-6 overflow-hidden">
                  {isClassic ? (
                    <div className="h-full flex flex-col">
                      <div className="h-8 bg-white border-b flex items-center px-3">
                        <div className="w-12 h-3 bg-gray-300 rounded" />
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-32 h-4 bg-white/30 rounded mx-auto mb-2" />
                          <div className="w-24 h-3 bg-white/20 rounded mx-auto mb-4" />
                          <div className="w-16 h-6 bg-white rounded mx-auto" />
                        </div>
                      </div>
                      <div className="h-20 bg-white p-3">
                        <div className="grid grid-cols-4 gap-2 h-full">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded" />
                          ))}
                        </div>
                      </div>
                      <div className="h-8 bg-gray-100 flex items-center justify-center">
                        <div className="w-24 h-2 bg-gray-300 rounded" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="h-6 bg-indigo-600" />
                      <div className="h-8 bg-white border-b flex items-center px-3">
                        <div className="w-16 h-3 bg-gray-300 rounded" />
                      </div>
                      <div className="flex-1 flex">
                        <div className="flex-1 bg-gray-50 p-3 flex flex-col justify-center">
                          <div className="w-24 h-4 bg-gray-300 rounded mb-2" />
                          <div className="w-32 h-3 bg-gray-200 rounded mb-3" />
                          <div className="w-16 h-6 bg-gray-900 rounded" />
                        </div>
                        <div className="flex-1 bg-gray-200" />
                      </div>
                      <div className="h-16 bg-white p-2 flex gap-2 justify-center">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="w-12 h-full bg-gray-100 rounded flex flex-col items-center justify-center">
                            <div className="w-4 h-4 bg-indigo-200 rounded-full mb-1" />
                            <div className="w-8 h-1.5 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    isClassic ? 'bg-purple-100' : 'bg-emerald-100'
                  )}>
                    {isClassic ? (
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Zap className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {template.sections.map((section) => (
                        <span
                          key={section.id}
                          className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                        >
                          {section.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            disabled={!selectedId}
            onClick={handleStart}
            className="px-8 gap-2"
          >
            Start with this template
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
