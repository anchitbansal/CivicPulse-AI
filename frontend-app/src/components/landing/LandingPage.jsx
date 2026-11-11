import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Wand2,
  MapPinned,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Target,
  Clock,
  Compass,
  Check,
  ChevronRight,
  BarChart3,
  Flame,
  FileCheck2,
} from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import SeverityBadge from '../common/SeverityBadge';
import PriorityIndicator from '../common/PriorityIndicator';

export default function LandingPage() {
  const steps = [
    {
      step: '01',
      title: 'Snap & Geo-Locate',
      desc: 'Citizens capture an issue with any phone or browser. GPS coordinates are extracted or pinned instantly.',
      icon: Camera,
      badge: 'Resident Intake',
    },
    {
      step: '02',
      title: 'AI Computer Vision',
      desc: 'YOLOv8 detects infrastructure defects, calculates pixel damage area, and generates a 1–100 priority score.',
      icon: Wand2,
      badge: 'FastAPI + YOLO',
    },
    {
      step: '03',
      title: '15m Geospatial Merge',
      desc: 'Nearby reports of the same incident within 15 meters consolidate into a single master ticket with upvote tracking.',
      icon: MapPinned,
      badge: 'GeoJSON 2D-Sphere',
    },
    {
      step: '04',
      title: 'Verify & Close',
      desc: 'Repairs are substantiated with before-and-after imagery, evaluated by SSIM similarity and damage area reduction.',
      icon: CheckCircle2,
      badge: 'Audited Resolution',
    },
  ];

  const intelligenceCards = [
    {
      title: 'YOLOv8 Edge Vision',
      subtitle: 'Instant Defect Localization',
      description: 'Accepts street-level photos and isolates bounding boxes for potholes, garbage heaps, streetlight hazards, traffic signals, and sewage spills with real-time confidence scores.',
      metric: '< 400ms',
      metricLabel: 'Inference speed',
      icon: Zap,
    },
    {
      title: 'Dynamic Priority Scoring',
      subtitle: 'Heuristic Impact Formula',
      description: 'Scores severity on a 1–100 scale factoring defect category weights, bounding box damage surface area, image sharpness (Laplacian variance), and user confidence.',
      metric: '1–100',
      metricLabel: 'Triaged scale',
      icon: Target,
    },
    {
      title: 'Geospatial Consolidation',
      subtitle: 'Noise & Duplicate Suppression',
      description: 'Eliminates redundant work orders by clustering reports of the same defect within a strict 15-meter radial threshold into an aggregated ticket with incident counters.',
      metric: '15 meters',
      metricLabel: 'Cluster threshold',
      icon: Compass,
    },
    {
      title: 'SSIM Resolution Audit',
      subtitle: 'Computer-Verified Fixes',
      description: 'Guarantees public accountability by evaluating before-and-after repair photography using structural similarity (SSIM) and damage area reduction percentages.',
      metric: 'SSIM + Δ%',
      metricLabel: 'Verification metric',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-civic-bg dark:bg-[#0B1220] text-navy-900 dark:text-[#F1F5F9] transition-colors duration-200 selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/60 to-civic-bg dark:from-[#111C2F] dark:via-[#0B1220] dark:to-[#0B1220] transition-colors duration-200">
          {/* Subtle background mesh */}
          <div className="absolute inset-0 civic-grid-pattern dark:civic-grid-pattern-dark opacity-60 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {/* Top Tagline Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/70 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-subtle mb-6 animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
                <span>Next-Generation Municipal Incident Triage</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 dark:text-white tracking-tight leading-[1.12]">
                Smarter Cities Start With{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500 dark:from-brand-400 dark:to-cyan-300">
                  Every Report.
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                An AI-powered civic intelligence platform that transforms citizen photos into prioritized, actionable infrastructure repairs with automated de-duplication.
              </p>

              {/* Primary CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  to="/report"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 dark:bg-brand-500 text-white font-semibold text-sm hover:bg-brand-700 dark:hover:bg-brand-400 transition-all shadow-glowBlue hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  to="/command-center"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800 dark:bg-[#17243A] text-white font-semibold text-sm hover:bg-navy-900 dark:hover:bg-[#1E2D4F] border border-transparent dark:border-slate-700 transition-all shadow-subtle hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Explore Command Center</span>
                </Link>
              </div>

              {/* Trust Badge Bar */}
              <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>15m Spatial De-duplication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>YOLOv8 Computer Vision</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Sub-second Priority Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-time Socket.IO Dispatch</span>
                </div>
              </div>
            </div>

            {/* Impressive Hero Visual / Live Command Preview Mock */}
            <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-3 sm:p-4 shadow-elevation dark:shadow-darkElevation">
              <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-navy-950 text-white p-4 sm:p-6 shadow-inner">
                {/* Header line of preview */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-navy-750">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                      Operational Dispatch Console • Live Stream
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>SOCKET CONNECTED</span>
                  </div>
                </div>

                {/* Simulated live grid */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item 1: Critical pothole */}
                  <div className="rounded-lg bg-navy-900 border border-navy-700/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">#CP-8492</span>
                      <SeverityBadge severity="CRITICAL" size="sm" />
                    </div>
                    <div className="text-sm font-bold text-white">Severe Pothole Cluster</div>
                    <div className="text-xs text-slate-400">Central Zone • 5th Ave &amp; 42nd St</div>
                    <PriorityIndicator score={92} size="sm" />
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-navy-800">
                      <span>Coverage: 74%</span>
                      <span className="text-cyan-400">5 Citizen Reports</span>
                    </div>
                  </div>

                  {/* Item 2: Medium garbage */}
                  <div className="rounded-lg bg-navy-900 border border-navy-700/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">#CP-7120</span>
                      <SeverityBadge severity="MEDIUM" size="sm" />
                    </div>
                    <div className="text-sm font-bold text-white">Overflowing Waste Dump</div>
                    <div className="text-xs text-slate-400">North Zone • Broadway &amp; 72nd</div>
                    <PriorityIndicator score={58} size="sm" />
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-navy-800">
                      <span>Coverage: 42%</span>
                      <span className="text-amber-400">3 Reports Merged</span>
                    </div>
                  </div>

                  {/* Item 3: Verified repair */}
                  <div className="rounded-lg bg-navy-900 border border-navy-700/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">#CP-6019</span>
                      <SeverityBadge severity="RESOLVED" size="sm" />
                    </div>
                    <div className="text-sm font-bold text-white">Damaged Streetlight Fixed</div>
                    <div className="text-xs text-slate-400">South Zone • Water St &amp; Fulton</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SSIM Verified: 0.88 (Clean)</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-navy-800">
                      <span>Resolved in 2.4h</span>
                      <span className="text-emerald-400">Verified Close</span>
                    </div>
                  </div>
                </div>

                {/* Footer preview note */}
                <div className="mt-4 pt-3 border-t border-navy-750 flex items-center justify-between text-xs text-slate-400">
                  <span>Geo-indexed with MongoDB 2dsphere • Real-time dispatch ready</span>
                  <Link to="/command-center" className="text-cyan-400 hover:underline flex items-center gap-1">
                    <span>Open Authority View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 sm:py-28 bg-white dark:bg-[#0E1729] border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/50 px-3 py-1 rounded-full border border-brand-100 dark:border-brand-800/60">
                End-to-End Workflow
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                From Citizen Photo to Verified Repair
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                Four automated stages turn chaotic public complaints into a clean, prioritized, and auditable municipal queue.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-6 shadow-card dark:shadow-darkCard hover:shadow-elevation dark:hover:shadow-darkElevation hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">{item.step}</span>
                      </div>
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mb-2">
                        {item.badge}
                      </span>
                      <h3 className="text-base font-bold text-navy-900 dark:text-white">{item.title}</h3>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-brand-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                      <span>Learn technical spec</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI INTELLIGENCE DEEP DIVE */}
        <section className="py-20 sm:py-28 bg-civic-bg dark:bg-[#0B1220] border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-100 dark:border-cyan-800/60">
                  Computer Vision &amp; Spatial Math
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                  Trained to Eliminate Guesswork
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                  CivicPulse AI combines object detection, camera blur variance metrics, and geospatial proximity queries into an automated decision-support pipeline.
                </p>
              </div>

              <Link
                to="/command-center"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-cyan-400 hover:text-brand-700 dark:hover:text-cyan-300"
              >
                <span>View Live Operations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {intelligenceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111C2F] p-6 sm:p-8 shadow-card dark:shadow-darkCard flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-12 h-12 rounded-xl bg-navy-800 dark:bg-[#17243A] text-cyan-400 flex items-center justify-center shadow-subtle border border-transparent dark:border-slate-700">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <span className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white font-mono">
                            {card.metric}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">{card.metricLabel}</span>
                        </div>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-navy-900 dark:text-white">{card.title}</h3>
                      <p className="text-xs font-semibold text-brand-600 dark:text-cyan-400 uppercase tracking-wider mt-0.5">
                        {card.subtitle}
                      </p>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CITIZEN VS AUTHORITY VALUE GRID */}
        <section className="py-20 sm:py-28 bg-white dark:bg-[#0E1729] border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Shared City Benefits
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white tracking-tight">
                Designed for Citizens. Engineered for Authorities.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Resident benefits */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-[#111C2F] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 dark:text-white">For City Residents</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fast, friction-free civic reporting</p>
                  </div>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No registration wall:</strong> Report instantly using any mobile browser with photo upload and automatic device GPS.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Transparent AI feedback:</strong> Immediately view detected severity, priority score, and damage area.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Upvote consolidation:</strong> If an issue was already reported nearby, your submission automatically boosts the ticket priority.</span>
                  </li>
                </ul>
              </div>

              {/* Authority benefits */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-[#111C2F] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 dark:bg-[#17243A] text-cyan-400 flex items-center justify-center border border-transparent dark:border-slate-700">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 dark:text-white">For Municipal Authorities</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Prioritized triage &amp; live crew dispatch</p>
                  </div>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Zero duplicate noise:</strong> Automated 15m radius spatial clustering prevents duplicate dispatch crews.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Live Dispatch Board:</strong> Drag-and-advance Kanban board with real-time Socket.IO incident feeds.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Proof-of-repair verification:</strong> Compare before and after photos with computer vision to audit closed tickets.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 sm:py-24 bg-navy-950 dark:bg-[#070C18] text-white relative overflow-hidden transition-colors duration-200">
          <div className="absolute inset-0 civic-grid-pattern-dark opacity-30 pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Upgrade City Infrastructure?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
              Experience the power of automated computer vision triage and real-time municipal response.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 text-navy-950 font-bold text-sm hover:bg-cyan-400 transition-all shadow-glow hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Submit a Citizen Report</span>
              </Link>
              <Link
                to="/command-center"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-navy-800 dark:bg-[#17243A] text-white font-bold text-sm border border-navy-700 dark:border-slate-700 hover:bg-navy-750 transition-all shadow-subtle hover:scale-105 active:scale-95"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Open Command Center</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
