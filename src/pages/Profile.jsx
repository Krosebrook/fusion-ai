/**
 * User Profile
 * View and edit user information
 */

import React, { useState } from 'react';
import { useAuth } from '../components/hooks/useAuth';
import { ProtectedRoute } from '../components/ui-library/ProtectedRoute';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { CinematicButton } from '../components/atoms/CinematicButton';
import { CinematicInput } from '../components/atoms/CinematicInput';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilePage() {
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await base44.auth.updateMe(formData);
      await checkAuth();
      setEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      bio: user?.bio || '',
    });
    setEditing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <User className="w-8 h-8 text-orange-500" />
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
            <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
            <p className="text-slate-400 text-lg">Manage your account information</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <CinematicCard className="p-6 lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">
                {user.full_name || 'No name set'}
              </h2>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </CinematicCard>

          {/* Info Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <CinematicCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                {!editing ? (
                  <CinematicButton variant="secondary" onClick={() => setEditing(true)}>
                    Edit
                  </CinematicButton>
                ) : (
                  <div className="flex gap-2">
                    <CinematicButton variant="ghost" onClick={handleCancel}>
                      Cancel
                    </CinematicButton>
                    <CinematicButton 
                      variant="primary" 
                      icon={Save} 
                      onClick={handleSave}
                      loading={saving}
                      glow
                    >
                      Save
                    </CinematicButton>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {editing ? (
                  <>
                    <CinematicInput
                      label="Full Name"
                      icon={User}
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Bio
                      </label>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                      <p className="text-white">{user.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                      <p className="text-white">{user.bio || 'No bio yet'}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-white">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </CinematicCard>

            {/* Account Info */}
            <CinematicCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Role
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium">
                    {user.role}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </p>
                  </div>
                  <p className="text-white">
                    {format(new Date(user.created_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CinematicCard>

            {/* Danger Zone */}
            <CinematicCard className="p-6 border-red-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Delete Account</p>
                    <p className="text-slate-400 text-sm">Permanently delete your account and all data</p>
                  </div>
                  <CinematicButton variant="ghost" className="text-red-400 hover:text-red-300 border-red-500/20">
                    Delete
                  </CinematicButton>
                </div>
              </div>
            </CinematicCard>
          </div>
        </div>
      </div>
    </div>
  );
}