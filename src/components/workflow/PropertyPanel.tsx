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
  const handleChange = (field: string, value: string | number) => {
    onUpdate?.(node.id, { [field]: value });
  };

  const handleDelete = () => {
    onDelete?.(node.id);
  };

  const renderFieldsByType = () => {
    switch (node.type) {
      case 'task':
      case 'assignment':
      case 'qa':
      case 'kpi':
      case 'report':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Enter node label"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-description">Description / Instructions</Label>
              <Textarea
                id="node-description"
                value={node.data?.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter task description or AI instructions"
                className="bg-card resize-none"
                rows={4}
              />
            </div>
          </>
        );

      case 'conditional':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Condition name"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-condition">Condition Expression</Label>
              <Input
                id="node-condition"
                value={node.data?.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                placeholder="e.g., quality >= 80"
                className="bg-card font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use ==, !=, &gt;, &lt;, &gt;=, &lt;= operators
              </p>
            </div>
          </>
        );

      case 'webhook':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Webhook name"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-url">Webhook URL</Label>
              <Input
                id="node-url"
                value={node.data?.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://n8n.example.com/webhook"
                className="bg-card font-mono text-sm"
              />
            </div>
          </>
        );

      case 'delay':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Delay name"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-delay">Delay (seconds)</Label>
              <Input
                id="node-delay"
                type="number"
                min={1}
                max={3600}
                value={node.data?.delay || 5}
                onChange={(e) => handleChange('delay', parseInt(e.target.value) || 5)}
                placeholder="5"
                className="bg-card font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Wait time in seconds (1-3600)
              </p>
            </div>
          </>
        );

      case 'loop':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Loop name"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-iterations">Iterations</Label>
              <Input
                id="node-iterations"
                type="number"
                min={1}
                max={100}
                value={node.data?.iterations || 3}
                onChange={(e) => handleChange('iterations', parseInt(e.target.value) || 3)}
                placeholder="3"
                className="bg-card font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-collection">Collection Variable (optional)</Label>
              <Input
                id="node-collection"
                value={node.data?.collection || ''}
                onChange={(e) => handleChange('collection', e.target.value)}
                placeholder="e.g., items"
                className="bg-card font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Variable name containing array to iterate
              </p>
            </div>
          </>
        );

      case 'email':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Email notification"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-to">To (email address)</Label>
              <Input
                id="node-to"
                type="email"
                value={node.data?.to || ''}
                onChange={(e) => handleChange('to', e.target.value)}
                placeholder="recipient@example.com"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-subject">Subject</Label>
              <Input
                id="node-subject"
                value={node.data?.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Workflow Notification"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-body">Body Template</Label>
              <Textarea
                id="node-body"
                value={node.data?.body || ''}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder="Email body content..."
                className="bg-card resize-none"
                rows={4}
              />
            </div>
          </>
        );

      case 'transform':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="node-label">Label</Label>
              <Input
                id="node-label"
                value={node.data?.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Transform name"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-transform">Transform Expression</Label>
              <Textarea
                id="node-transform"
                value={node.data?.transform || ''}
                onChange={(e) => handleChange('transform', e.target.value)}
                placeholder="e.g., data.map(x => x.toUpperCase())"
                className="bg-card font-mono text-sm resize-none"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                JavaScript expression to transform data
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-input">Input Variable</Label>
              <Input
                id="node-input"
                value={node.data?.inputVar || ''}
                onChange={(e) => handleChange('inputVar', e.target.value)}
                placeholder="e.g., data"
                className="bg-card font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-output">Output Variable</Label>
              <Input
                id="node-output"
                value={node.data?.outputVar || ''}
                onChange={(e) => handleChange('outputVar', e.target.value)}
                placeholder="e.g., transformedData"
                className="bg-card font-mono text-sm"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={node.data?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Enter node label"
              className="bg-card"
            />
          </div>
        );
    }
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

        {renderFieldsByType()}

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
