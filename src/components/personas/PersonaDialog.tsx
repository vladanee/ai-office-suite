import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tables } from '@/integrations/supabase/types';

type Persona = Tables<'personas'>;
type Department = Tables<'departments'>;

const AVATAR_OPTIONS = ['🤖', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '🧑‍💼', '🧑‍💻', '🧑‍🔬'];

const personaSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  role: z.string().trim().min(1, 'Role is required').max(100, 'Role must be less than 100 characters'),
  avatar: z.string().optional(),
  department_id: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  status: z.enum(['active', 'idle', 'busy']).optional(),
  system_prompt: z.string().max(2000, 'System prompt must be less than 2000 characters').optional(),
});

type PersonaFormData = z.infer<typeof personaSchema>;

interface PersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona?: Persona | null;
  departments: Department[];
  onSave: (data: PersonaFormData) => Promise<{ error: Error | null }>;
}

export function PersonaDialog({
  open,
  onOpenChange,
  persona,
  departments,
  onSave,
}: PersonaDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [status, setStatus] = useState<'active' | 'idle' | 'busy'>('idle');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEditing = !!persona;

  useEffect(() => {
    if (persona) {
      setName(persona.name);
      setRole(persona.role);
      setAvatar(persona.avatar || '🤖');
      setDepartmentId(persona.department_id);
      setSkills(persona.skills || []);
      setStatus((persona.status as 'active' | 'idle' | 'busy') || 'idle');
      setSystemPrompt(persona.system_prompt || '');
    } else {
      setName('');
      setRole('');
      setAvatar('🤖');
      setDepartmentId(null);
      setSkills([]);
      setStatus('idle');
      setSystemPrompt('');
    }
    setErrors({});
    setSkillInput('');
  }, [persona, open]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
    const data = {
      name,
      role,
      avatar,
      department_id: departmentId,
      skills,
      status,
      system_prompt: systemPrompt || undefined,
    };

    const result = personaSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    const { error } = await onSave(result.data);
    setSaving(false);

    if (!error) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Persona' : 'Create Persona'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar Selection */}
          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex Support"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Customer Support Lead"
              className={errors.role ? 'border-destructive' : ''}
            />
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={departmentId || 'none'}
              onValueChange={(v) => setDepartmentId(v === 'none' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a skill and press Enter"
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Max 10 skills</p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define how this AI persona should behave..."
              rows={4}
              className={errors.system_prompt ? 'border-destructive' : ''}
            />
            {errors.system_prompt && (
              <p className="text-sm text-destructive">{errors.system_prompt}</p>
            )}
            <p className="text-xs text-muted-foreground">{systemPrompt.length}/2000 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}