import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import ReportPage from './components/report/ReportPage';
import CommandCenterPage from './components/command/CommandCenterPage';
import RoleBanner from './components/layout/RoleBanner';
import Chatbot from './components/chat/Chatbot';

// Citizen Portal Views
import CitizenDashboard from './components/citizen/CitizenDashboard';
import CitizenComplaintsList from './components/citizen/CitizenComplaintsList';
import CitizenComplaintDetail from './components/citizen/CitizenComplaintDetail';

// Worker Portal Views
import WorkerDashboard from './components/worker/WorkerDashboard';
import WorkerTaskList from './components/worker/WorkerTaskList';
import WorkerTaskDetail from './components/worker/WorkerTaskDetail';
import WorkerSubmitResolution from './components/worker/WorkerSubmitResolution';

// Admin Portal Views
import AdminComplaintsManager from './components/admin/AdminComplaintsManager';
import AdminVerificationQueue from './components/admin/AdminVerificationQueue';
import AdminWorkerManager from './components/admin/AdminWorkerManager';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Demo Role Switcher Banner */}
      <RoleBanner />

      <div className="flex-1">
        <Routes>
          {/* Public & Core Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/command-center" element={<CommandCenterPage />} />

          {/* Citizen Portal */}
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/report" element={<ReportPage />} />
          <Route path="/citizen/issues" element={<CitizenComplaintsList />} />
          <Route path="/citizen/issues/:id" element={<CitizenComplaintDetail />} />
          <Route path="/citizen" element={<Navigate to="/citizen/dashboard" replace />} />

          {/* Worker / Field Specialist Portal */}
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/tasks" element={<WorkerTaskList />} />
          <Route path="/worker/tasks/:id" element={<WorkerTaskDetail />} />
          <Route path="/worker/tasks/:id/resolve" element={<WorkerSubmitResolution />} />
          <Route path="/worker" element={<Navigate to="/worker/dashboard" replace />} />

          {/* Admin Command Portal */}
          <Route path="/admin/dashboard" element={<CommandCenterPage />} />
          <Route path="/admin/complaints" element={<AdminComplaintsManager />} />
          <Route path="/admin/verifications" element={<AdminVerificationQueue />} />
          <Route path="/admin/workers" element={<AdminWorkerManager />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>

      <Chatbot />
    </div>
  );
}
