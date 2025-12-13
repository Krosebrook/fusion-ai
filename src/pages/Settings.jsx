/**
 * Settings
 * App preferences and configuration
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/hooks/useAuth';
import { ProtectedRoute } from '../components/ui-library/ProtectedRoute';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Bell, Moon, Sun, 
  Globe, Keyboard, Zap, Save
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: {
      email: true,
      push: false,
      generationComplete: true,
      weeklyDigest: true,
    },
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    keyboardShortcuts: true,
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('user-settings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('user-settings', JSON.stringify(settings));
    toast.success('Settings saved');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <SettingsIcon className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) return <ProtectedRoute />;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-600/10" />
        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400 text-lg">Customize your FlashFusion experience</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Appearance */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-slate-400 text-sm">Use dark theme across the app</p>
              </div>
              <Switch 
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
            </div>
          </div>
        </CinematicCard>

        {/* Notifications */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-slate-400 text-sm">Receive updates via email</p>
              </div>
              <Switch 
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotification('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-slate-400 text-sm">Browser push notifications</p>
              </div>
              <Switch 
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateNotification('push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Generation Complete</p>
                <p className="text-slate-400 text-sm">Notify when AI generation finishes</p>
              </div>
              <Switch 
                checked={settings.notifications.generationComplete}
                onCheckedChange={(checked) => updateNotification('generationComplete', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Weekly Digest</p>
                <p className="text-slate-400 text-sm">Summary of your activity</p>
              </div>
              <Switch 
                checked={settings.notifications.weeklyDigest}
                onCheckedChange={(checked) => updateNotification('weeklyDigest', checked)}
              />
            </div>
          </div>
        </CinematicCard>

        {/* Localization */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Localization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <Select value={settings.language} onValueChange={(val) => updateSetting('language', val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timezone
              </label>
              <Select value={settings.timezone} onValueChange={(val) => updateSetting('timezone', val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CinematicCard>

        {/* Advanced */}
        <CinematicCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Advanced
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Auto-save
                </p>
                <p className="text-slate-400 text-sm">Automatically save work in progress</p>
              </div>
              <Switch 
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  Keyboard Shortcuts
                </p>
                <p className="text-slate-400 text-sm">Enable keyboard shortcuts</p>
              </div>
              <Switch 
                checked={settings.keyboardShortcuts}
                onCheckedChange={(checked) => updateSetting('keyboardShortcuts', checked)}
              />
            </div>
          </div>
        </CinematicCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <CinematicButton 
            variant="primary" 
            icon={Save} 
            onClick={handleSave}
            glow
          >
            Save Settings
          </CinematicButton>
        </div>
      </div>
    </div>
  );
}