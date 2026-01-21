import { useState } from 'react';
import { FileText, Search, Star, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskTemplate } from '@/hooks/useTaskTemplates';
import { cn } from '@/lib/utils';

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: TaskTemplate[];
  onSelect: (template: TaskTemplate) => void;
  onCreateNew: () => void;
}

export function TemplatePicker({ 
  open, 
  onOpenChange, 
  templates, 
  onSelect,
  onCreateNew 
}: TemplatePickerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))] as string[];
  
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !search || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.title_template.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: TaskTemplate) => {
    onSelect(template);
    onOpenChange(false);
    setSearch('');
    setSelectedCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Choose a Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map(cat => (
                <Badge 
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Templates Grid */}
          <ScrollArea className="h-[400px]">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {templates.length === 0 ? 'No templates yet' : 'No matching templates'}
                </p>
                <Button variant="link" onClick={onCreateNew}>
                  Create your first template
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 pr-4">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md',
                    )}
                    onClick={() => handleSelect(template)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{template.name}</h4>
                          {template.usage_count > 5 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {template.title_template}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={template.priority === 'high' ? 'destructive' : template.priority === 'medium' ? 'warning' : 'secondary'}
                            className="text-xs"
                          >
                            {template.priority}
                          </Badge>
                          {template.category && (
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          )}
                          {template.estimated_hours && (
                            <span className="text-xs text-muted-foreground">
                              ~{template.estimated_hours}h
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            Used {template.usage_count}×
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
