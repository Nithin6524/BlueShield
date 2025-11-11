'use client';

import React, { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    emailUpdates: true,
    dataSharing: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // TODO: Implement API call to update profile
      console.log('Updating profile:', { username: formData.username, email: formData.email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement API call to change password
      console.log('Changing password');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // TODO: Implement API call to update preferences
      console.log('Updating preferences:', {
        notifications: formData.notifications,
        emailUpdates: formData.emailUpdates,
        dataSharing: formData.dataSharing
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' }
  ];

  return (
    <AuthGuard>
      <main className="min-h-screen bg-ocean-deep pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Account Settings</h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Manage your profile information, security settings, and preferences.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={cn(
              "mb-6 p-4 rounded-lg border",
              message.type === 'success' 
                ? "bg-green-500/10 border-green-400/40 text-green-300" 
                : "bg-red-500/10 border-red-400/40 text-red-300"
            )}>
              {message.text}
            </div>
          )}

          <div>
            <div className="bg-ocean-deep backdrop-blur-sm">
              {/* Tabs */}
              <div className="px-4 sm:px-6">
                <div className="flex space-x-6 border-b border-white/10">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "py-4 text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "text-white border-b-2 border-ocean-accent"
                          : "text-white/70 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 sm:p-8">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                      {!isEditing && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="secondary"
                          size="sm"
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={cn(
                              "w-full px-4 py-3 rounded-lg border transition-colors",
                              isEditing
                                ? "bg-white/10 border-white/30 text-white focus:border-ocean-primary focus:ring-1 focus:ring-ocean-primary"
                                : "bg-white/5 border-white/20 text-white/60"
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={cn(
                              "w-full px-4 py-3 rounded-lg border transition-colors",
                              isEditing
                                ? "bg-white/10 border-white/30 text-white focus:border-ocean-primary focus:ring-1 focus:ring-ocean-primary"
                                : "bg-white/5 border-white/20 text-white/60"
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Account Created
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Last Login
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60">
                          {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex space-x-4">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-ocean-primary hover:bg-ocean-primary/80"
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                username: user?.username || '',
                                email: user?.email || '',
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                                notifications: true,
                                emailUpdates: true,
                                dataSharing: false
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                    
                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white focus:border-ocean-primary focus:ring-1 focus:ring-ocean-primary"
                          placeholder="Enter your current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white focus:border-ocean-primary focus:ring-1 focus:ring-ocean-primary"
                          placeholder="Enter your new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white focus:border-ocean-primary focus:ring-1 focus:ring-ocean-primary"
                          placeholder="Confirm your new password"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                        className="bg-ocean-primary hover:bg-ocean-primary/80"
                      >
                        {isLoading ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/20">
                      <Button
                        onClick={() => {
                          logout();
                        }}
                        className="border-red-500/50 text-red-300 hover:text-white hover:bg-red-500 cursor-pointer bg-red-500/10"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>
                    
                    <form onSubmit={handleSavePreferences} className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20">
                          <div>
                            <h3 className="font-medium text-white">Push Notifications</h3>
                            <p className="text-sm text-white/60">Receive notifications about new predictions and alerts</p>
                          </div>
                          <input
                            type="checkbox"
                            name="notifications"
                            checked={formData.notifications}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-ocean-primary bg-white/10 border-white/30 rounded accent-ocean-accent cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20">
                          <div>
                            <h3 className="font-medium text-white">Email Updates</h3>
                            <p className="text-sm text-white/60">Receive email updates about platform changes and new features</p>
                          </div>
                          <input
                            type="checkbox"
                            name="emailUpdates"
                            checked={formData.emailUpdates}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-ocean-primary bg-white/10 border-white/30 rounded accent-ocean-accent cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20">
                          <div>
                            <h3 className="font-medium text-white">Data Sharing</h3>
                            <p className="text-sm text-white/60">Allow anonymous data sharing for research purposes</p>
                          </div>
                          <input
                            type="checkbox"
                            name="dataSharing"
                            checked={formData.dataSharing}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-ocean-primary bg-white/10 border-white/30 rounded accent-ocean-accent cursor-pointer"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-ocean-primary hover:bg-ocean-primary/80"
                      >
                        {isLoading ? 'Saving Preferences...' : 'Save Preferences'}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
};

export default AccountPage;
