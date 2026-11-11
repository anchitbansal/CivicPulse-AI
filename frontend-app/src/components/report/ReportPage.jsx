import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Upload,
  LocateFixed,
  MapPin,
  Send,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Info,
  Car,
  Trash,
  Lightbulb,
  Droplets,
} from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import ReportLocationMap from './ReportLocationMap';
import AIAnalysisResultModal from './AIAnalysisResultModal';
import { reportTicket } from '../../services/api';

export default function ReportPage() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    defect_type: 'pothole',
    latitude: '40.7306',
    longitude: '-73.9867',
    description: 'Pothole on roadway causing traffic slowdown and hazard for cyclists.',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');
  const [gpsStatus, setGpsStatus] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Result modal state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defectOptions = [
    { id: 'pothole', label: 'Pothole / Road Damage', icon: Car, hint: 'Craters, road cracks, asphalt degradation' },
    { id: 'garbage', label: 'Overflowing Garbage', icon: Trash, hint: 'Illegal dumping, uncollected dumpsters' },
    { id: 'streetlight', label: 'Streetlight Defect', icon: Lightbulb, hint: 'Broken lamps, exposed wiring, outages' },
    { id: 'traffic_light', label: 'Traffic Light / Signal Hazard', icon: AlertTriangle, hint: 'Signal outage, damaged traffic head, exposed wiring' },
    { id: 'sewage', label: 'Sewage / Water Spill', icon: Droplets, hint: 'Manhole leak, hazardous water pooling' },
  ];

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorStatus('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setErrorStatus('');
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported on this device.');
      return;
    }

    setGpsStatus('Querying device GPS satellites...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setGpsStatus(`GPS Acquired (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setGpsStatus('Location access denied. Please pin on map.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus('');

    if (!selectedFile) {
      setErrorStatus('Please attach or capture a photo before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('defect_type', form.defect_type);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('description', form.description);
      formData.append('status', 'Pending');

      const response = await reportTicket(formData);
      setAnalysisResult(response);
      setIsModalOpen(true);
    } catch (err) {
      console.error('[Submit Error]', err);
      setErrorStatus(err.message || 'Submission failed. Please verify connection to backend service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsModalOpen(false);
    setAnalysisResult(null);
    clearFile();
    setForm({
      defect_type: 'pothole',
      latitude: '40.7306',
      longitude: '-73.9867',
      description: '',
    });
    setGpsStatus('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-civic-bg dark:bg-[#0B1220] text-navy-900 dark:text-[#F1F5F9] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Citizen Infrastructure Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Report a Civic Infrastructure Issue
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Upload a street photo and pin its location. Our YOLOv8 AI pipeline detects defect severity and assigns real-time municipal priority.
            </p>
          </div>

          {errorStatus && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Submission Warning</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{errorStatus}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: CAPTURE PHOTO */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-5 sm:p-7 shadow-card dark:shadow-darkCard transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-navy-900 dark:text-white">Capture Issue Photo</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Clear photos improve AI detection accuracy</p>
                  </div>
                </div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {!previewUrl ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors flex flex-col items-center justify-center ${
                    isDragOver
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-[#0E1729]/50'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#17243A] shadow-subtle border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-cyan-400 mb-4">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white">Upload or snap photo</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Drag and drop your image here, or select from your camera roll.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 dark:bg-brand-500 text-white text-xs font-semibold hover:bg-brand-700 dark:hover:bg-brand-400 transition-colors shadow-subtle"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment');
                          fileInputRef.current.click();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#17243A] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-[#1E2D4F] border border-transparent dark:border-slate-700 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Use Camera</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center max-h-80">
                    <img src={previewUrl} alt="Defect upload preview" className="object-contain max-h-80 w-auto" />
                    <div className="absolute top-3 right-3 bg-navy-950/80 backdrop-blur-sm text-cyan-400 text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Ready for YOLOv8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{selectedFile?.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                    >
                      Replace photo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
            </div>

            {/* STEP 2: PIN LOCATION */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-5 sm:p-7 shadow-card dark:shadow-darkCard transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-navy-900 dark:text-white">Pin Incident Location</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">15-meter proximity activates automatic duplicate grouping</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#17243A] hover:bg-slate-200 dark:hover:bg-[#1E2D4F] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-700 transition-colors"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
                  <span>My Location</span>
                </button>
              </div>

              {gpsStatus && (
                <div className="mb-4 text-xs font-medium text-brand-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>{gpsStatus}</span>
                </div>
              )}

              {/* Interactive Leaflet Map */}
              <ReportLocationMap
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationChange={(lat, lng) => setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A] text-xs font-mono text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A] text-xs font-mono text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: CATEGORIZE & DETAILS */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-5 sm:p-7 shadow-card dark:shadow-darkCard transition-colors">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-navy-900 dark:text-white">Categorize &amp; Describe</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Provide details to assist field dispatch crews</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Defect selector cards */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-2">
                    Issue Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {defectOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = form.defect_type === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setForm({ ...form, defect_type: opt.id })}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500 shadow-subtle'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#17243A]'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-navy-900 dark:text-white">{opt.label}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.hint}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Description &amp; Observed Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe size, depth, safety hazards, or notable landmarks..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17243A] text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON ROW */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Reports are geo-indexed and reviewed according to municipal priority scoring standards.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 dark:bg-brand-500 text-white font-bold text-sm hover:bg-brand-700 dark:hover:bg-brand-400 transition-all shadow-glowBlue hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with AI Vision...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit &amp; Analyze Issue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {/* AI Analysis Result Modal */}
      <AIAnalysisResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={analysisResult}
        onReset={handleResetForm}
      />
    </div>
  );
}
