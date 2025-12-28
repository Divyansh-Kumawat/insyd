'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface FollowUp {
  id: string;
  type: string;
  scheduledAt: string;
  message: string;
  status: string;
  approved: boolean;
  lead: {
    id: string;
    name: string;
    email: string;
    category: string;
    productInterest: string;
  };
}

export default function ApprovalsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingFollowUps();
  }, []);

  const fetchPendingFollowUps = async () => {
    try {
      const response = await fetch('/api/follow-ups?status=PENDING');
      const data = await response.json();
      setFollowUps(data);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (followUpId: string, sendImmediately: boolean = false) => {
    // Optimistic update: Remove the item immediately from UI
    const previousFollowUps = [...followUps];
    setFollowUps(followUps.filter(f => f.id !== followUpId));

    try {
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followUpId,
          action: 'approve',
          approvedBy: 'admin',
          sendImmediately,
        }),
      });

      if (!response.ok) {
        // Revert on error
        console.error('Failed to approve, reverting UI');
        setFollowUps(previousFollowUps);
        alert('Failed to approve follow-up. Please try again.');
        return;
      }
      
      // Optional: Background refresh to ensure consistency
      fetchPendingFollowUps();
    } catch (error) {
      console.error('Error approving follow-up:', error);
      // Revert on error
      setFollowUps(previousFollowUps);
      alert('Error approving follow-up. Please check your connection.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'HOT': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'WARM': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'COLD': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Follow-up Approvals</h1>
              <p className="text-slate-400 text-sm">Review and approve automated follow-up emails</p>
            </div>
            <Link 
              href="/admin/dashboard"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-amber-300">{followUps.length}</div>
            <div className="text-amber-200 text-sm">Pending Approvals</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-300">
              {followUps.filter(f => f.type === 'INITIAL').length}
            </div>
            <div className="text-blue-200 text-sm">Initial Contacts</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-300">
              {followUps.filter(f => f.type !== 'INITIAL').length}
            </div>
            <div className="text-purple-200 text-sm">Follow-ups</div>
          </div>
        </div>

        {/* Follow-up Cards */}
        {loading ? (
          <div className="text-center text-slate-300 py-12">Loading approvals...</div>
        ) : followUps.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-300">No pending follow-ups to approve right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <div 
                key={followUp.id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Lead Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{followUp.lead.name}</h3>
                    <div className="text-slate-400 text-sm mb-3">{followUp.lead.email}</div>
                    <div className="flex gap-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(followUp.lead.category)}`}>
                        {followUp.lead.category}
                      </span>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                        {followUp.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-3 text-slate-400 text-xs">
                      Product: {followUp.lead.productInterest}
                    </div>
                    <div className="text-slate-500 text-xs">
                      Scheduled: {formatDistanceToNow(new Date(followUp.scheduledAt), { addSuffix: true })}
                    </div>
                  </div>

                  {/* Email Preview */}
                  <div className="md:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="text-xs text-slate-400 mb-2">EMAIL PREVIEW</div>
                      <div className="text-slate-500 text-xs mb-2">
                        To: {followUp.lead.email}<br />
                        Subject: Following up on your {followUp.lead.productInterest} inquiry
                      </div>
                      <div className="border-t border-white/10 pt-3 mt-2">
                        <div className="text-white text-sm mb-2">Hi {followUp.lead.name},</div>
                        <div className="text-slate-300 text-sm whitespace-pre-wrap">{followUp.message}</div>
                        <div className="text-slate-400 text-sm mt-3">
                          Best regards,<br />
                          Sales Team
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApprove(followUp.id, true)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-lg transition-all"
                      >
                        ✅ Approve & Send Now
                      </button>
                      <button
                        onClick={() => handleApprove(followUp.id, false)}
                        className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold rounded-lg border border-blue-400/30 transition-all"
                      >
                        📅 Approve for Scheduled Time
                      </button>
                      <button
                        className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-400/30 transition-all"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
