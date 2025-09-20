import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Shield, Database, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application preferences and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how and when you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-alerts">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for critical alerts
                </p>
              </div>
              <Switch id="email-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sensor-alerts">Sensor Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when sensors detect unusual readings
                </p>
              </div>
              <Switch id="sensor-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="irrigation-alerts">Irrigation Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for irrigation schedule events
                </p>
              </div>
              <Switch id="irrigation-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-recommendations">AI Recommendation Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new AI recommendations are available
                </p>
              </div>
              <Switch id="ai-recommendations" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Preferences
            </CardTitle>
            <CardDescription>
              Configure system behavior and data management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Automatic Data Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup your data daily
                </p>
              </div>
              <Switch id="auto-backup" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-retention">Extended Data Retention</Label>
                <p className="text-sm text-muted-foreground">
                  Keep historical data for more than 1 year
                </p>
              </div>
              <Switch id="data-retention" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-recommendations">Auto-generate Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Let AI automatically create recommendations
                </p>
              </div>
              <Switch id="auto-recommendations" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="real-time-sync">Real-time Data Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Sync data across devices in real-time
                </p>
              </div>
              <Switch id="real-time-sync" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy settings and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the platform by sharing usage data
                </p>
              </div>
              <Switch id="analytics" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch id="two-factor" />
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Download My Data
              </Button>
              <Button variant="outline" className="w-full">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account and session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Need to sign out of your account? This will end your current session.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Application Information</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Version: 1.0.0</p>
                  <p>Build: Production</p>
                  <p>Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}