'use client';

import React from 'react';
import toast from 'react-hot-toast';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UserManagerProps {
  usersList: UserRecord[];
  isLoading: boolean;
  onRefreshNeeded: () => void;
}

export default function UserManager({
  usersList,
  isLoading,
  onRefreshNeeded,
}: UserManagerProps) {
  const handleDeleteUser = async (id: string, email: string) => {
    const toastId = toast.loading('Deleting user...');
    try {
      await fetch(`/api/admin/users/manage?id=${id}`, { method: 'DELETE' });
      toast.success(`User ${email} deleted`, { id: toastId });
      onRefreshNeeded();
    } catch (e) {
      toast.error('Failed to delete user', { id: toastId });
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    const toastId = toast.loading(`Changing role to ${newRole}...`);
    try {
      const res = await fetch('/api/admin/users/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`, { id: toastId });
        onRefreshNeeded();
      } else {
        toast.error('Failed to update role', { id: toastId });
      }
    } catch (e) {
      toast.error('Error updating role', { id: toastId });
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
        Registered Accounts ({usersList.length})
      </h2>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading registered users...
        </div>
      ) : usersList.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No registered users found.
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-y-auto max-h-[380px]">
          {usersList.map((usr) => (
            <div key={usr.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{usr.name}</h3>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      usr.role === 'admin'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {usr.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{usr.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleRole(usr.id, usr.role)}
                  className="text-xs text-slate-700 hover:text-slate-900 font-semibold transition-all cursor-pointer"
                >
                  {usr.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                </button>

                <button
                  onClick={() => handleDeleteUser(usr.id, usr.email)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
