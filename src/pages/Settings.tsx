/**
 * Settings - Application and user preferences
 */

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Wallet,
  Eye,
  Globe,
  Moon,
  Sun,
  Database,
  Key,
  AlertTriangle,
  Save,
  Copy,
  ExternalLink,
  Trash2
} from 'lucide-react';

export default function Settings() {
  const { connected, publicKey } = useWallet();

  // General Settings
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showReputation, setShowReputation] = useState(true);
  const [showTaskHistory, setShowTaskHistory] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  // Network Settings
  const [rpcEndpoint, setRpcEndpoint] = useState('https://api.devnet.solana.com');
  const [autoRetry, setAutoRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);

  const handleSaveSettings = (section: string) => {
    toast.success(
      <div>
        <p className="font-semibold">Settings Saved!</p>
        <p className="text-sm">{section} preferences updated</p>
      </div>
    );
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      toast.success('Address copied to clipboard!');
    }
  };

  const handleExportData = () => {
    toast.info('Data export will begin shortly...');
    setTimeout(() => {
      toast.success('Data exported successfully!');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    toast.error(
      <div>
        <p className="font-semibold">Account Deletion</p>
        <p className="text-sm">This action cannot be undone. Please contact support.</p>
      </div>
    );
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access settings
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="network">
            <Database className="mr-2 h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Display Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="SOL">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handleSaveSettings('General')}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>
                Your connected Solana wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-mono text-sm">
                      {publicKey?.toBase58().slice(0, 16)}...{publicKey?.toBase58().slice(-8)}
                    </p>
                    <p className="text-xs text-muted-foreground">Solana Devnet</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Agents</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">7,500</p>
                  <p className="text-xs text-muted-foreground">Reputation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Export data or delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleExportData}>
                <Database className="mr-2 h-4 w-4" />
                Export Account Data
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
                <Switch
                  id="push"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="tasks">Task Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Validation results and task completions
                    </p>
                  </div>
                  <Switch
                    id="tasks"
                    checked={taskUpdates}
                    onCheckedChange={setTaskUpdates}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payments">Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Received and sent transactions
                    </p>
                  </div>
                  <Switch
                    id="payments"
                    checked={paymentAlerts}
                    onCheckedChange={setPaymentAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="security">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Login attempts and security issues
                    </p>
                  </div>
                  <Switch
                    id="security"
                    checked={securityAlerts}
                    onCheckedChange={setSecurityAlerts}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Notification')}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="visibility">Profile Visibility</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="verified">Verified Agents Only</SelectItem>
                    <SelectItem value="private">Private - Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reputation">Show Reputation Score</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your reputation publicly
                  </p>
                </div>
                <Switch
                  id="reputation"
                  checked={showReputation}
                  onCheckedChange={setShowReputation}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="history">Show Task History</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see your completed tasks
                  </p>
                </div>
                <Switch
                  id="history"
                  checked={showTaskHistory}
                  onCheckedChange={setShowTaskHistory}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="messages">Allow Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users contact you
                  </p>
                </div>
                <Switch
                  id="messages"
                  checked={allowDirectMessages}
                  onCheckedChange={setAllowDirectMessages}
                />
              </div>

              <Button onClick={() => handleSaveSettings('Privacy')}>
                <Save className="mr-2 h-4 w-4" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Settings */}
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
              <CardDescription>
                Configure your Solana network settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rpc">RPC Endpoint</Label>
                <Input
                  id="rpc"
                  value={rpcEndpoint}
                  onChange={(e) => setRpcEndpoint(e.target.value)}
                  placeholder="https://api.devnet.solana.com"
                />
                <p className="text-xs text-muted-foreground">
                  Custom Solana RPC endpoint URL
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="retry">Auto Retry Failed Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically retry if transaction fails
                  </p>
                </div>
                <Switch
                  id="retry"
                  checked={autoRetry}
                  onCheckedChange={setAutoRetry}
                />
              </div>

              {autoRetry && (
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Maximum Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min={1}
                    max={10}
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                  />
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Network Status</h4>
                    <p className="text-sm text-yellow-800">
                      Currently connected to Solana Devnet. 
                      Transactions may take 400-800ms to confirm.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Network')}>
                <Save className="mr-2 h-4 w-4" />
                Save Network Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
              <CardDescription>
                Your account security overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Wallet Connected</p>
                      <p className="text-sm text-green-700">Your wallet is securely connected</p>
                    </div>
                  </div>
                  <Badge variant="default">Secure</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Hardware Wallet Support</p>
                      <p className="text-sm text-blue-700">Ledger and Trezor compatible</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Best practices for account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Use a hardware wallet</p>
                    <p className="text-muted-foreground">
                      Protect your assets with Ledger or Trezor
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Key className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Never share your private keys</p>
                    <p className="text-muted-foreground">
                      Keep your seed phrase secure and offline
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Verify transactions carefully</p>
                    <p className="text-muted-foreground">
                      Always review recipient address and amounts
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
