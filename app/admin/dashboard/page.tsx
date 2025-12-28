'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  productInterest: string;
  message: string;
  category: string;
  aiConfidence: number | null;
  aiReasoning: string | null;
  status: string;
  priority: string;
  createdAt: string;
  followUps: any[];
  approvals: any[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  productInterest: string;
  message: string;
  category: string;
  status: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  productInterest: 'Laminate Flooring',
  message: '',
  category: 'WARM',
  status: 'NEW',
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    converted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      
      if (!response.ok || !Array.isArray(data)) {
        console.error('Failed to fetch leads:', data);
        setLeads([]);
        return;
      }
      
      setLeads(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Lead[]) => {
    setStats({
      total: data.length,
      hot: data.filter((l) => l.category === 'HOT').length,
      warm: data.filter((l) => l.category === 'WARM').length,
      cold: data.filter((l) => l.category === 'COLD').length,
      converted: data.filter((l) => l.status === 'CONVERTED').length,
    });
  };

  const handleCreateClick = () => {
    setFormData(INITIAL_FORM_DATA);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || '',
      productInterest: lead.productInterest,
      message: lead.message,
      category: lead.category,
      status: lead.status,
    });
    // Store ID in selectedLead if not already there, but usually it is because we open details first
    if (!selectedLead) setSelectedLead(lead);
    
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const url = '/api/leads';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing 
        ? { ...formData, id: selectedLead?.id } 
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save lead');

      const result = await response.json();
      
      // Update local state properly
      let updatedLeads;
      if (isEditing) {
        updatedLeads = leads.map(l => l.id === result.lead.id ? { ...l, ...result.lead } : l);
        // Also update selected lead view if open
         if (selectedLead?.id === result.lead.id) {
             const updated = { ...selectedLead, ...result.lead };
             setSelectedLead(updated);
         }
      } else {
        updatedLeads = [result.lead, ...leads];
      }
      
      setLeads(updatedLeads);
      calculateStats(updatedLeads);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save lead. Please try again.');
    } finally {
      setFormSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-purple-500/20 text-purple-300';
      case 'CONTACTED': return 'bg-blue-500/20 text-blue-300';
      case 'QUALIFIED': return 'bg-cyan-500/20 text-cyan-300';
      case 'NURTURING': return 'bg-amber-500/20 text-amber-300';
      case 'CONVERTED': return 'bg-emerald-500/20 text-emerald-300';
      case 'LOST': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Lead Management Dashboard</h1>
              <p className="text-slate-400 text-sm">Monitor and manage your leads in real-time</p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={handleCreateClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                + New Lead
              </button>
              <Link 
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                ← Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-slate-300 text-sm">Total Leads</div>
          </div>
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-300">{stats.hot}</div>
            <div className="text-red-200 text-sm">🔥 HOT Leads</div>
          </div>
          <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-amber-300">{stats.warm}</div>
            <div className="text-amber-200 text-sm">☀️ WARM Leads</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-300">{stats.cold}</div>
            <div className="text-blue-200 text-sm">❄️ COLD Leads</div>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-300">{stats.converted}</div>
            <div className="text-emerald-200 text-sm">✅ Converted</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          <Link 
            href="/admin/dashboard"
            className="px-6 py-3 bg-blue-500/20 border-b-2 border-blue-400 text-blue-300 font-semibold"
          >
            All Leads
          </Link>
          <Link 
            href="/admin/approvals"
            className=" px-6 py-3 text-slate-300 hover:text-white transition-colors"
          >
            Approvals
            {leads.some(l => l.approvals && l.approvals.length > 0) && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {leads.reduce((acc, l) => acc + (l.approvals ? l.approvals.length : 0), 0)}
              </span>
            )}
          </Link>
        </div>

        {/* Leads Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-300">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-slate-300">No leads yet. Submit the inquiry form to test!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Lead Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">AI Analysis</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Follow-ups</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{lead.name}</div>
                        <div className="text-slate-400 text-sm">{lead.email}</div>
                        <div className="text-slate-500 text-xs">{lead.productInterest}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(lead.category)}`}>
                          {lead.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 text-sm">
                          {lead.aiConfidence && (
                            <div className="mb-1">
                              Confidence: <span className="font-semibold">{Math.round(lead.aiConfidence * 100)}%</span>
                            </div>
                          )}
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">{lead.aiReasoning}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 text-sm">
                          {lead.followUps ? lead.followUps.length : 0} scheduled
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-sm transition-all">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && !isFormOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLead(null)}
          >
            <div 
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white max-w-[400px] truncate">{selectedLead.name}</h2>
                  <p className="text-slate-400">{selectedLead.email} • {selectedLead.phone}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                    onClick={() => handleEditClick(selectedLead)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                    Edit
                    </button>
                    <button 
                    onClick={() => setSelectedLead(null)}
                    className="text-slate-400 hover:text-white text-2xl px-2"
                    >
                    ×
                    </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4"> 
                    <div>
                        <label className="text-sm text-slate-400">Company</label>
                        <div className="text-white">{selectedLead.company || 'Not provided'}</div>
                    </div>
                     <div>
                        <label className="text-sm text-slate-400">Status</label>
                        <div>
                           <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedLead.status)}`}>
                             {selectedLead.status}
                           </span>
                        </div>
                    </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Product Interest</label>
                  <div className="text-white">{selectedLead.productInterest}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Message</label>
                  <div className="text-white bg-white/5 p-4 rounded-lg whitespace-pre-wrap">{selectedLead.message}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Category</label>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(selectedLead.category)}`}>
                        {selectedLead.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">AI Confidence</label>
                    <div className="text-white font-semibold">
                      {selectedLead.aiConfidence ? Math.round(selectedLead.aiConfidence * 100) + '%' : 'N/A'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">AI Reasoning</label>
                  <div className="text-slate-300 text-sm">{selectedLead.aiReasoning}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Scheduled Follow-ups</label>
                  <div className="space-y-2 mt-2">
                    {selectedLead.followUps?.length > 0 ? selectedLead.followUps.map((followUp: any) => (
                      <div key={followUp.id} className="bg-white/5 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="text-white text-sm font-semibold">{followUp.type}</div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            followUp.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300' :
                            followUp.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {followUp.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          Scheduled: {new Date(followUp.scheduled_at || followUp.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                    )) : <div className="text-slate-500 text-sm">No follow-ups scheduled</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Lead Modal */}
        {isFormOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={() => setIsFormOpen(false)}
          >
            <div 
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Lead' : 'Create New Lead'}</h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                
                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                        <option value="HOT">HOT</option>
                        <option value="WARM">WARM</option>
                        <option value="COLD">COLD</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                        <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="NURTURING">NURTURING</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="LOST">LOST</option>
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Product Interest *</label>
                  <select
                    required
                    value={formData.productInterest}
                    onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select a product</option>
                    <option value="Laminate Flooring">Laminate Flooring</option>
                    <option value="Hardwood Flooring">Hardwood Flooring</option>
                    <option value="Vinyl Flooring">Vinyl Flooring</option>
                    <option value="Wall Laminates">Wall Laminates</option>
                    <option value="LED Lighting">LED Lighting</option>
                    <option value="Decorative Lighting">Decorative Lighting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    placeholder="Notes or original inquiry message..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                     <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={formSubmitting}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {formSubmitting ? 'Saving...' : isEditing ? 'Update Lead' : 'Create Lead'}
                    </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
