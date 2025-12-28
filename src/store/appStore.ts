import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

export interface Office {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  template?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  personaCount: number;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  departmentId: string;
  skills: string[];
  status: 'active' | 'idle' | 'busy';
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  progress: number;
  currentNode?: string;
}

interface AppState {
  // Office
  currentOffice: Office | null;
  offices: Office[];
  setCurrentOffice: (office: Office) => void;
  addOffice: (office: Office) => void;
  
  // Departments
  departments: Department[];
  addDepartment: (department: Department) => void;
  
  // Personas
  personas: Persona[];
  addPersona: (persona: Persona) => void;
  updatePersona: (id: string, updates: Partial<Persona>) => void;
  
  // Workflow
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  
  // Runs
  runs: WorkflowRun[];
  addRun: (run: WorkflowRun) => void;
  updateRun: (id: string, updates: Partial<WorkflowRun>) => void;
  
  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Office
  currentOffice: {
    id: '1',
    name: 'Acme Corp',
    description: 'Main headquarters office',
    createdAt: new Date(),
    template: 'support',
  },
  offices: [
    {
      id: '1',
      name: 'Acme Corp',
      description: 'Main headquarters office',
      createdAt: new Date(),
      template: 'support',
    },
    {
      id: '2',
      name: 'TechStart Inc',
      description: 'Startup accelerator',
      createdAt: new Date(),
      template: 'sales',
    },
  ],
  setCurrentOffice: (office) => set({ currentOffice: office }),
  addOffice: (office) => set((state) => ({ offices: [...state.offices, office] })),
  
  // Departments
  departments: [
    { id: '1', name: 'Customer Support', description: 'Handle customer inquiries', color: 'primary', personaCount: 5 },
    { id: '2', name: 'Sales', description: 'Drive revenue growth', color: 'accent', personaCount: 3 },
    { id: '3', name: 'Engineering', description: 'Build products', color: 'success', personaCount: 8 },
    { id: '4', name: 'Marketing', description: 'Brand awareness', color: 'warning', personaCount: 4 },
  ],
  addDepartment: (department) => set((state) => ({ departments: [...state.departments, department] })),
  
  // Personas
  personas: [
    { id: '1', name: 'Sarah Chen', role: 'Support Lead', avatar: 'SC', departmentId: '1', skills: ['Communication', 'Problem Solving'], status: 'active' },
    { id: '2', name: 'Mike Johnson', role: 'Sales Rep', avatar: 'MJ', departmentId: '2', skills: ['Negotiation', 'CRM'], status: 'busy' },
    { id: '3', name: 'Emily Davis', role: 'Engineer', avatar: 'ED', departmentId: '3', skills: ['React', 'Node.js'], status: 'active' },
    { id: '4', name: 'Alex Rivera', role: 'Marketing Mgr', avatar: 'AR', departmentId: '4', skills: ['SEO', 'Content'], status: 'idle' },
    { id: '5', name: 'Jordan Kim', role: 'QA Analyst', avatar: 'JK', departmentId: '3', skills: ['Testing', 'Automation'], status: 'active' },
  ],
  addPersona: (persona) => set((state) => ({ personas: [...state.personas, persona] })),
  updatePersona: (id, updates) => set((state) => ({
    personas: state.personas.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  
  // Workflow
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  // Runs
  runs: [
    { id: '1', workflowId: 'wf-1', status: 'completed', startedAt: new Date(Date.now() - 3600000), completedAt: new Date(Date.now() - 1800000), progress: 100 },
    { id: '2', workflowId: 'wf-1', status: 'running', startedAt: new Date(), progress: 45, currentNode: 'task-1' },
    { id: '3', workflowId: 'wf-2', status: 'failed', startedAt: new Date(Date.now() - 7200000), completedAt: new Date(Date.now() - 6000000), progress: 23 },
  ],
  addRun: (run) => set((state) => ({ runs: [...state.runs, run] })),
  updateRun: (id, updates) => set((state) => ({
    runs: state.runs.map((r) => r.id === id ? { ...r, ...updates } : r),
  })),
  
  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
