import { motion } from 'framer-motion';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Key,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TopBar } from '@/components/layout/TopBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfficeSettingsTab } from '@/components/settings/OfficeSettingsTab';
import { ProfileSettingsTab } from '@/components/settings/ProfileSettingsTab';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'office', label: 'Office & Team', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'api', label: 'API Keys', icon: Key },
];

export default function Settings() {
  return (
    <div className="min-h-screen">
      <TopBar 
        title="Settings" 
        subtitle="Manage your account and preferences"
      />

      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary p-1 h-auto flex-wrap gap-1">
            {settingsSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <section.icon className="w-4 h-4 mr-2" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettingsTab />
          </TabsContent>

          <TabsContent value="office">
            <OfficeSettingsTab />
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Workflow Completions', description: 'Get notified when a workflow run completes' },
                    { label: 'Failed Runs', description: 'Alert when a workflow fails or encounters errors' },
                    { label: 'New Team Members', description: 'Notification when someone joins your office' },
                    { label: 'Weekly Reports', description: 'Receive weekly performance summaries' },
                    { label: 'System Updates', description: 'Important updates about AI Office platform' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password regularly for security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" className="bg-card max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" className="bg-card max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" className="bg-card max-w-md" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">Secure your account with authenticator app</p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="api">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for external integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Production Key</p>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                    <code className="text-sm text-muted-foreground font-mono">sk_prod_****************************</code>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">Development Key</p>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                    <code className="text-sm text-muted-foreground font-mono">sk_dev_****************************</code>
                  </div>
                  <Button>
                    <Key className="w-4 h-4 mr-2" />
                    Create New Key
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Placeholder for other tabs */}
          <TabsContent value="billing">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  Billing settings coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
