import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getTicketById, submitResolution } from '../../services/api';

export default function WorkerSubmitResolution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proofImage, setProofImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofImage) {
      setError('A resolution proof photograph is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('proof_images', proofImage);
      formData.append('completion_notes', notes);

      await submitResolution(id, formData);
      navigate('/worker/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit resolution proof');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] flex items-center justify-center p-6 text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to={`/worker/tasks/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Back to Task
        </Link>

        <div className="bg-white dark:bg-[#111C2F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider">
              Step 2 of 2: Proof Submission
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Submit Repair Resolution Proof
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload clear photographic evidence showing completed repairs on {ticket?.title || ticket?.defect_type}.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload Zone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Completion Photo (After Fix) *
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-900">
                  <img
                    src={imagePreview}
                    alt="Proof preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/80 text-white text-xs font-semibold hover:bg-slate-900 transition"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl p-8 cursor-pointer bg-slate-50/50 dark:bg-[#17243A]/40 transition text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 flex items-center justify-center transition mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Snap or Upload Completion Photo
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPG, or WEBP up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Technician Completion Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Work Summary & Technician Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail materials used, equipment deployed, or any specific instructions followed..."
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-[#17243A] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link
                to={`/worker/tasks/${id}`}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Submitting Proof...' : 'Submit for Admin Signoff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
