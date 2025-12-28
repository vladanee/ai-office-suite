import { motion } from 'framer-motion';
import { 
  Plug, 
  ExternalLink, 
  Check, 
  Plus,
  Settings,
  Webhook
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopBar } from '@/components/layout/TopBar';

const integrations = [
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Open-source workflow automation',
    icon: '🔄',
    connected: true,
    category: 'Automation',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: '💬',
    connected: true,
    category: 'Communication',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and version control',
    icon: '🐙',
    connected: false,
    category: 'Development',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project and issue tracking',
    icon: '📋',
    connected: false,
    category: 'Project Management',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Documentation and knowledge base',
    icon: '📝',
    connected: true,
    category: 'Documentation',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps',
    icon: '⚡',
    connected: false,
    category: 'Automation',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Integrations() {
  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Integrations" 
        subtitle="Connect your favorite tools"
        actions={
          <Button>
            <Webhook className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="gradient">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Plug className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Webhook className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">Active Webhooks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="gradient">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">1,284</p>
                  <p className="text-sm text-muted-foreground">API Calls Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* n8n Special Card */}
        <Card variant="glow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">
                  🔄
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    n8n Integration
                    <Badge variant="success">Connected</Badge>
                  </CardTitle>
                  <CardDescription>
                    Your primary workflow automation engine
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Endpoint</p>
                <p className="font-mono text-sm text-foreground truncate">https://n8n.aioffice.io/webhook</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm text-foreground">2 minutes ago</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <p className="text-sm text-success">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>Connect additional tools and services</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {integrations.map((integration) => (
                <motion.div
                  key={integration.id}
                  variants={itemVariants}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 group cursor-pointer
                    ${integration.connected 
                      ? 'bg-success/5 border-success/30 hover:border-success/50' 
                      : 'bg-secondary/50 border-border hover:border-primary/30'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{integration.icon}</div>
                    {integration.connected ? (
                      <Badge variant="success">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                  <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
