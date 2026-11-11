import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  Map as MapIcon,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import StatCard from '../common/StatCard';
import CommandMap from './CommandMap';
import ActivityFeed from './ActivityFeed';
import DispatchBoard from './DispatchBoard';
import IncidentDrawer from './IncidentDrawer';
import VerificationView from './VerificationView';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { getTickets, updateTicketStatus } from '../../services/api';
import { subscribeToIncidents } from '../../services/socket';

export default function CommandCenterPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [activityEvents, setActivityEvents] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Active View Tab: 'overview' | 'map' | 'dispatch' | 'verification'
  const [activeTab, setActiveTab] = useState('overview');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [defectFilter, setDefectFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');

  // Fetch initial data
  const loadTickets = async () => {
    try {
      const data = await getTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.warn('[CommandCenter] Failed to fetch tickets:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Socket.IO event subscription
  useEffect(() => {
    const unsubscribe = subscribeToIncidents({
      onCreated: (incident) => {
        setTickets((prev) => {
          const exists = prev.some((t) => t._id === incident._id);
          if (exists) {
            return prev.map((t) => (t._id === incident._id ? incident : t));
          }
          return [incident, ...prev];
        });

        setActivityEvents((prev) => [
          {
            id: `created-${Date.now()}`,
            type: 'CREATED',
            ticket: incident,
            timeAgo: 'Just now',
          },
          ...prev.slice(0, 20),
        ]);
      },
      onUpdated: (incident) => {
        setTickets((prev) =>
          prev.map((t) => (t._id === incident._id ? incident : t))
        );

        setActivityEvents((prev) => [
          {
            id: `updated-${Date.now()}`,
            type: 'UPDATED',
            ticket: incident,
            timeAgo: 'Just now',
          },
          ...prev.slice(0, 20),
        ]);
      },
      onResolved: (incident) => {
        setTickets((prev) =>
          prev.map((t) => (t._id === incident._id ? incident : t))
        );

        setActivityEvents((prev) => [
          {
            id: `resolved-${Date.now()}`,
            type: 'RESOLVED',
            ticket: incident,
            timeAgo: 'Just now',
          },
          ...prev.slice(0, 20),
        ]);
      },
      onStatusChange: (status) => {
        setIsSocketConnected(status);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Status progression action
  const handleStatusUpdate = async (ticketId, nextStatus) => {
    try {
      const updatedTicket = await updateTicketStatus(ticketId, nextStatus);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...updatedTicket } : t))
      );
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, ...updatedTicket }));
      }
    } catch (err) {
      console.error('[Status Update Error]', err);
    }
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
  };

  // Filtered tickets based on active controls
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (defectFilter !== 'All' && t.defect_type !== defectFilter) return false;
      if (severityFilter !== 'All' && t.severity !== severityFilter) return false;
      if (zoneFilter !== 'All' && t.zone !== zoneFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = t._id?.toLowerCase().includes(query);
        const matchesType = t.defect_type?.toLowerCase().includes(query);
        if (!matchesId && !matchesType) return false;
      }
      return true;
    });
  }, [tickets, defectFilter, severityFilter, zoneFilter, searchQuery]);

  // Operational KPI computations
  const totalCount = tickets.length;
  const criticalCount = tickets.filter((t) => t.severity === 'CRITICAL' && t.status !== 'Resolved').length;
  const inFieldCount = tickets.filter((t) => t.status === 'Assigned' || t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-civic-bg dark:bg-[#0B1220] text-navy-900 dark:text-[#F1F5F9] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Municipal Command &amp; Control
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight mt-0.5">
                Authority Command Center
              </h1>
            </div>

            {/* Status Pills & Refresh */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  isSocketConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span>{isSocketConnected ? 'LIVE SOCKET STREAM' : 'SOCKET RECONNECTING'}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsRefreshing(true);
                  loadTickets();
                }}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A] hover:bg-slate-50 dark:hover:bg-[#1E2D4F] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-subtle disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* KPI Statistics Row */}
          {isLoading ? (
            <LoadingSkeleton type="stats" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Incidents"
                value={totalCount}
                subtitle="Triaged on municipal dispatch wire"
                icon={Activity}
                tone="navy"
              />
              <StatCard
                title="Critical Incidents"
                value={criticalCount}
                subtitle="Requires priority dispatch"
                icon={AlertCircle}
                tone="critical"
              />
              <StatCard
                title="In-Field Operations"
                value={inFieldCount}
                subtitle="Assigned or in repair"
                icon={TrendingUp}
                tone="warning"
              />
              <StatCard
                title="Resolution Rate"
                value={`${resolutionRate}%`}
                subtitle={`${resolvedCount} of ${totalCount} verified closed`}
                icon={CheckCircle2}
                tone="success"
              />
            </div>
          )}

          {/* Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-navy-800 dark:bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#17243A]'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-navy-800 dark:bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#17243A]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Incident Map</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dispatch')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dispatch'
                    ? 'bg-navy-800 dark:bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#17243A]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dispatch Board</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'verification'
                    ? 'bg-navy-800 dark:bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#17243A]'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Verification Archive</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket ID or defect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-navy-900 dark:text-white bg-white dark:bg-[#17243A] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-subtle"
              />
            </div>
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#111C2F] p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs shadow-subtle transition-colors">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Defect Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400">Defect:</span>
              <select
                value={defectFilter}
                onChange={(e) => setDefectFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-[#17243A] text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="All">All Defects</option>
                <option value="pothole">Pothole</option>
                <option value="garbage">Garbage</option>
                <option value="streetlight">Streetlight</option>
                <option value="traffic_light">Traffic Light</option>
                <option value="sewage">Sewage</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-[#17243A] text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="All">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Zone Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 dark:text-slate-400">Zone:</span>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-[#17243A] text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="All">All Zones</option>
                <option value="central">Central</option>
                <option value="north">North</option>
                <option value="south">South</option>
              </select>
            </div>

            {(defectFilter !== 'All' || severityFilter !== 'All' || zoneFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setDefectFilter('All');
                  setSeverityFilter('All');
                  setZoneFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs text-brand-600 dark:text-cyan-400 font-semibold hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* MAIN VIEW CONTENT ACCORDING TO TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Half: Operational Leaflet Map + Realtime Activity Wire */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 min-h-[380px]">
                  <CommandMap
                    tickets={filteredTickets}
                    onSelectTicket={handleSelectTicket}
                  />
                </div>
                <div className="min-h-[380px]">
                  <ActivityFeed
                    events={activityEvents}
                    isConnected={isSocketConnected}
                    onSelectTicket={handleSelectTicket}
                  />
                </div>
              </div>

              {/* Bottom Half: 4-Column Kanban Dispatch Board */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-navy-900 dark:text-white tracking-tight">
                      Dispatch Kanban Queue
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage lifecycle from citizen report to verified resolution
                    </p>
                  </div>
                </div>

                <DispatchBoard
                  tickets={filteredTickets}
                  onSelectTicket={handleSelectTicket}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="min-h-[600px] h-[75vh]">
              <CommandMap
                tickets={filteredTickets}
                onSelectTicket={handleSelectTicket}
                className="h-full"
              />
            </div>
          )}

          {activeTab === 'dispatch' && (
            <DispatchBoard
              tickets={filteredTickets}
              onSelectTicket={handleSelectTicket}
              onStatusUpdate={handleStatusUpdate}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationView
              tickets={filteredTickets}
              onSelectTicket={handleSelectTicket}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* Slide-over Incident Inspector Drawer */}
      <IncidentDrawer
        ticket={selectedTicket}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
