import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Clock,
  AlertTriangle,
  Play,
  CheckCircle,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { getTicketById, acceptAssignment, API_BASE } from '../../services/api';
import { subscribeToTicketUpdates } from '../../services/socket';

export default function WorkerTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        console.error('Failed to load task:', err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const unsubscribe = subscribeToTicketUpdates(id, (eventData) => {
      if (eventData.ticket) {
        setTicket(eventData.ticket);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleStartWork = async () => {
    setAccepting(true);
    try {
      await acceptAssignment(id);
      const updated = await getTicketById(id);
      setTicket(updated);
    } catch (err) {
      alert(err.message || 'Failed to start task');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex items-center justify-center p-6 text-slate-400">
        <div className="text-center space-y-2">
          <Clock className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-sm">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex items-center justify-center p-6 text-slate-400">
        <div className="text-center space-y-4">
          <p className="text-base text-slate-200">Task not found.</p>
          <Link
            to="/worker/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Task Queue
          </Link>
        </div>
      </div>
    );
  }

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url}`;
  };

  const coordinates = ticket.location?.coordinates || [-73.9867, 40.7306];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;

  const isInProgress = ticket.status === 'IN_PROGRESS' || ticket.status === 'In Progress';
  const isAssigned = ticket.status === 'ASSIGNED' || ticket.status === 'Assigned' || ticket.status === 'REPORTED';
  const isPendingVerification = ticket.status === 'PENDING_VERIFICATION';
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'Resolved';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/worker/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>

        {/* Task Header */}
        <div className="bg-white dark:bg-[#111C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  TASK #{ticket._id.toString().slice(-6)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {ticket.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {ticket.severity}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {ticket.title || ticket.defect_type?.replace('_', ' ').toUpperCase()}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {ticket.location?.address || ticket.location?.ward || 'Central Ward'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Navigation className="w-4 h-4 text-blue-500" />
                GPS Directions
              </a>

              {isAssigned && (
                <button
                  type="button"
                  disabled={accepting}
                  onClick={handleStartWork}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  {accepting ? 'Starting...' : 'Start Work (On Site)'}
                </button>
              )}

              {isInProgress && (
                <Link
                  to={`/worker/tasks/${ticket._id}/resolve`}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Completion Proof
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Details & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Defect Photo */}
          <div className="bg-white dark:bg-[#111C2F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reported Defect Visual
            </span>
            <div className="h-64 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {ticket.before_image_url ? (
                <img
                  src={formatImageUrl(ticket.before_image_url)}
                  alt="Defect visual"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> No photographic evidence attached
                </div>
              )}
            </div>
          </div>

          {/* Operational Instructions & Specifications */}
          <div className="bg-white dark:bg-[#111C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              Repair Specification
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#17243A]">
                <div className="text-slate-400 mb-0.5">Defect Classification</div>
                <div className="font-bold capitalize text-slate-900 dark:text-white">
                  {ticket.defect_type?.replace('_', ' ')} (Score: {ticket.priority_score}/100)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#17243A]">
                <div className="text-slate-400 mb-0.5">Estimated Damage Area</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {ticket.before_damage_pct || 40}% Surface Degradation
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#17243A]">
                <div className="text-slate-400 mb-0.5">Municipal Instructions</div>
                <div className="text-slate-700 dark:text-slate-300">
                  Deploy required equipment, cordon hazardous perimeter, execute standard repair protocol, and photograph final result for administrative signoff.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
