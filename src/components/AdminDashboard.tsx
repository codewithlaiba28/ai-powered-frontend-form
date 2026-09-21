'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Registration } from '@/lib/db';
import { 
  Lock, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign, 
  Users, 
  Eye, 
  X, 
  Filter,
  ShieldAlert,
  ArrowUpDown,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Screenshot viewer modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Check auth session on load
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: password ? { 'x-admin-password': password } : {},
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load registrations');

      setRegistrations(data.registrations || []);
      setIsAuthenticated(true);
    } catch (err: any) {
      setFetchError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthenticating(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      setIsAuthenticated(true);
      fetchRegistrations();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'pending' | 'confirmed' | 'rejected') => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(password ? { 'x-admin-password': password } : {}),
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      // Optimistic state update
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, status: newStatus } : reg))
      );
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.whatsapp.includes(searchQuery) ||
        (reg.email && reg.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        reg.transaction_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchQuery, statusFilter]);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter((r) => r.status === 'confirmed');
    const pending = registrations.filter((r) => r.status === 'pending');
    const rejected = registrations.filter((r) => r.status === 'rejected');

    // Revenue calculation: Confirmed * 8,500 (with legacy fallback for earlier entries)
    const estimatedRevenue = confirmed.reduce((acc, r) => {
      if (r.format === 'Live Classes') return acc + 10000;
      if (r.format === 'Recorded') return acc + 5000;
      return acc + 8500;
    }, 0);

    return {
      total,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      estimatedRevenue,
    };
  }, [registrations]);

  // Password Login Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-4 py-12">
        <div className="glass-panel rounded-3xl p-8 glow-border text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2dd4bf]/20 to-[#10b981]/20 border border-[#2dd4bf]/30 flex items-center justify-center mx-auto mb-6 text-[#2dd4bf]">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Admin Portal Access</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter password to view registration & payment records for AI-Powered Frontend Developer.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117]/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition"
              />
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3.5 px-6 rounded-xl btn-gradient font-bold text-sm"
            >
              {authenticating ? 'Verifying...' : 'Unlock Admin Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-semibold text-[#2dd4bf] mb-2 border border-[#2dd4bf]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Course Registrations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-Powered Frontend Developer by Laiba Khan
          </p>
        </div>

        <button
          onClick={fetchRegistrations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2dd4bf]' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Registrations */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Registrations</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{metrics.total}</p>
          <p className="text-[11px] text-slate-500 mt-1">All submitted entries</p>
        </div>

        {/* Total Confirmed */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Confirmed Seats</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-2">{metrics.confirmedCount}</p>
          <p className="text-[11px] text-emerald-500/80 mt-1">Payment verified & active</p>
        </div>

        {/* Total Pending */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Verification</span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2">{metrics.pendingCount}</p>
          <p className="text-[11px] text-amber-500/80 mt-1">Awaiting status check</p>
        </div>

        {/* Revenue Estimate */}
        <div className="glass-panel p-5 rounded-2xl border border-[#2dd4bf]/30 bg-gradient-to-br from-emerald-950/30 to-[#0d1117] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2dd4bf]">Estimated Revenue</span>
            <div className="p-2 rounded-xl bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            PKR {metrics.estimatedRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#2dd4bf]/80 mt-1">Confirmed seats × PKR 8,500</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1117] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2dd4bf]"
          >
            <option value="all">All Statuses ({registrations.length})</option>
            <option value="pending">Pending ({metrics.pendingCount})</option>
            <option value="confirmed">Confirmed ({metrics.confirmedCount})</option>
            <option value="rejected">Rejected ({metrics.rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      {fetchError && (
        <div className="p-4 mb-6 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
          {fetchError}
        </div>
      )}

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117]/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">City</th>
                <th className="p-4">Format</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4 text-center">Screenshot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading && registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#2dd4bf] border-t-transparent rounded-full animate-spin" />
                      <span>Loading registration records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    No registrations found matching your query.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-900/40 transition">
                    {/* Name & Email */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{reg.name}</div>
                      {reg.email && <div className="text-[11px] text-slate-400">{reg.email}</div>}
                    </td>

                    {/* WhatsApp */}
                    <td className="p-4">
                      <a
                        href={`https://wa.me/${reg.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2dd4bf] hover:underline font-mono font-semibold flex items-center gap-1"
                      >
                        {reg.whatsapp}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </td>

                    {/* City */}
                    <td className="p-4 text-slate-300 font-medium">{reg.city}</td>

                    {/* Format */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          reg.format === 'Live Classes'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {reg.format}
                      </span>
                    </td>

                    {/* Transaction ID */}
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {reg.transaction_id}
                    </td>

                    {/* Screenshot Thumbnail */}
                    <td className="p-4 text-center">
                      {reg.screenshot_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(reg.screenshot_url)}
                          className="relative inline-block w-10 h-10 rounded-lg overflow-hidden border border-slate-700 hover:border-[#2dd4bf] transition group"
                        >
                          {/* eslint-disable-next-next/no-img-element */}
                          <img
                            src={reg.screenshot_url}
                            alt="Receipt"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">No image</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        disabled={updatingId === reg.id}
                        value={reg.status}
                        onChange={(e) =>
                          handleStatusChange(
                            reg.id,
                            e.target.value as 'pending' | 'confirmed' | 'rejected'
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border focus:outline-none transition ${
                          reg.status === 'confirmed'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : reg.status === 'rejected'
                            ? 'bg-red-950/80 text-red-300 border-red-500/40'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <option value="pending" className="bg-slate-900 text-amber-300">
                          Pending
                        </option>
                        <option value="confirmed" className="bg-slate-900 text-emerald-300">
                          Confirmed
                        </option>
                        <option value="rejected" className="bg-slate-900 text-red-300">
                          Rejected
                        </option>
                      </select>
                    </td>

                    {/* Created Date */}
                    <td className="p-4 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(reg.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">Payment Screenshot Preview</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black">
              {/* eslint-disable-next-next/no-img-element */}
              <img
                src={previewImage}
                alt="Full Screenshot"
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
