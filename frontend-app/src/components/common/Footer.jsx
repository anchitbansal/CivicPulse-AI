import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2F] text-slate-600 dark:text-slate-400 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-navy-800 dark:bg-navy-700 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-navy-900 dark:text-white text-base">CivicPulse AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-medium border border-brand-100 dark:border-brand-800/60">
                GovTech Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Bridging residents and municipal teams through real-time computer vision triage, geospatial report de-duplication, and verified repair workflows.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <Cpu className="w-3.5 h-3.5 text-cyan-500" />
              <span>YOLOv8 Vision Inference • Google Gemini AI • MongoDB 2D-Sphere</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Report Civic Issue
                </Link>
              </li>
              <li>
                <Link to="/command-center" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Authority Command Center
                </Link>
              </li>
            </ul>
          </div>

          {/* System Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white mb-3">Specifications</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center justify-between">
                <span>Duplicate Radius</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">15 meters</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Vision Scoring</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">1–100 Scale</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Verification</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">SSIM &amp; Delta Area</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Protocol</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">WebSocket / GeoJSON</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} CivicPulse AI Platform. Built for open municipal accountability.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All Services Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
