'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface CreateAdminFormProps {
  onAdminCreated: () => void;
}

export default function CreateAdminForm({ onAdminCreated }: CreateAdminFormProps) {
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!adminName || !adminEmail || !adminPassword) {
      toast.error('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading('Creating admin account...');

    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create admin', { id: toastId });
      } else {
        toast.success(`Admin user ${adminName} created!`, { id: toastId });
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        onAdminCreated();
      }
    } catch (err: any) {
      toast.error('Error creating admin account', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Create Admin User</h2>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="Garbita Chowdhury"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="admin2@shoptrend.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all cursor-pointer"
        >
          <span>{isSubmitting ? 'Creating...' : 'Create Admin Account'}</span>
        </button>
      </form>
    </div>
  );
}
