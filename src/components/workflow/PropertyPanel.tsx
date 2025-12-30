import { Node } from 'reactflow';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface PropertyPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate?: (nodeId: string, data: any) => void;
  onDelete?: (nodeId: string) => void;
}

export function PropertyPanel({ node, onClose, onUpdate, onDelete }: PropertyPanelProps) {
  const handleLabelChange = (value: string) => {
    onUpdate?.(node.id, { label: value });
  };

  const handleDescriptionChange = (value: string) => {
    onUpdate?.(node.id, { description: value });
  };

  const handleConditionChange = (value: string) => {
    onUpdate?.(node.id, { condition: value });
  };

  const handleUrlChange = (value: string) => {
    onUpdate?.(node.id, { url: value });
  };

  const handleDelete = () => {
    onDelete?.(node.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Node Properties</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-id" className="text-xs text-muted-foreground">
            Node ID
          </Label>
          <Input
            id="node-id"
            value={node.id}
            disabled
            className="font-mono text-xs bg-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-type" className="text-xs text-muted-foreground">
            Type
          </Label>
          <Input
            id="node-type"
            value={node.type || 'default'}
            disabled
            className="bg-secondary capitalize"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={node.data?.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter node label"
            className="bg-card"
          />
        </div>

        {node.data?.description !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="node-description">Description</Label>
            <Textarea
              id="node-description"
              value={node.data?.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Enter description"
              className="bg-card resize-none"
              rows={3}
            />
          </div>
        )}

        {node.data?.condition !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="node-condition">Condition</Label>
            <Input
              id="node-condition"
              value={node.data?.condition || ''}
              onChange={(e) => handleConditionChange(e.target.value)}
              placeholder="e.g., quality >= 80"
              className="bg-card font-mono text-sm"
            />
          </div>
        )}

        {node.data?.url !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="node-url">Webhook URL</Label>
            <Input
              id="node-url"
              value={node.data?.url || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://n8n.example.com/webhook"
              className="bg-card font-mono text-sm"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pos-x" className="text-xs text-muted-foreground">X</Label>
              <Input
                id="pos-x"
                value={Math.round(node.position.x)}
                disabled
                className="bg-secondary font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="pos-y" className="text-xs text-muted-foreground">Y</Label>
              <Input
                id="pos-y"
                value={Math.round(node.position.y)}
                disabled
                className="bg-secondary font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {node.type !== 'start' && node.type !== 'end' && (
        <Button variant="destructive" className="w-full" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      )}
    </div>
  );
}