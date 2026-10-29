'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  Power,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Paintbrush,
  DollarSign,
  PhoneCall,
  Sliders
} from 'lucide-react';
import {
  updatePlatformSettingsAction,
  toggleMaintenanceModeAction
} from '@/modules/settings/actions';
import { SETTINGS_STATE, type PlatformSettings } from '@/modules/settings/state';

export default function SettingsManagementPage() {
  const [settings, setSettings] = useState<PlatformSettings>(SETTINGS_STATE);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState(settings.maintenanceReason || 'Scheduled database update & security patch');
  const [downtimeMinutes, setDowntimeMinutes] = useState(30);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updatePlatformSettingsAction(
        {
          siteName: settings.siteName,
          brandMaroonColor: settings.brandMaroonColor,
          currency: settings.currency,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          maxBetLimit: Number(settings.maxBetLimit),
          maxMarketExposure: Number(settings.maxMarketExposure)
        },
        {
          actor: { id: 'adm_current', email: 'root@cricketbuyy.com', isSuperAdmin: true, roles: ['super_admin'], permissions: ['setting:update'] }
        }
      );

      if (res.success) {
        setFeedback('Platform settings and financial limits updated successfully.');
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const nextState = !settings.maintenanceMode;

    try {
      const res = await toggleMaintenanceModeAction(
        {
          maintenanceEnabled: nextState,
          reason: maintenanceReason,
          estimatedDowntimeMinutes: downtimeMinutes
        },
        {
          actor: { id: 'adm_current', email: 'root@cricketbuyy.com', isSuperAdmin: true, roles: ['super_admin'], permissions: ['setting:maintenance_toggle'] }
        }
      );

      if (res.success) {
        setSettings((prev) => ({ ...prev, maintenanceMode: nextState, maintenanceReason: nextState ? maintenanceReason : null }));
        setIsMaintenanceOpen(false);
        setFeedback(
          nextState
            ? 'Emergency Maintenance Mode ACTIVATED. Signed event broadcasted to customer website.'
            : 'Maintenance Mode DEACTIVATED. Public trading restored.'
        );
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#e53e3e]" />
            Global Platform Settings & Integration Contract
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            System configuration, brand parameters, financial risk limits, and cross-site maintenance control.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Emergency Maintenance Mode Banner (Integration Contract) */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          settings.maintenanceMode
            ? 'bg-rose-950/50 border-rose-800'
            : 'bg-[#151218] border-[#4a1c22]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert
                className={`w-5 h-5 ${settings.maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-[#e53e3e]'}`}
              />
              <h2 className="text-base font-bold text-white">
                Platform Maintenance Mode ({settings.maintenanceMode ? 'ACTIVE' : 'STANDBY'})
              </h2>
            </div>
            <p className="text-xs text-zinc-300">
              When enabled, a cryptographically signed signal is emitted to the customer site (<code>cricketbuyy.com</code>), displaying maintenance screens and halting order matching.
            </p>
            {settings.maintenanceMode && settings.maintenanceReason && (
              <div className="mt-2 text-xs font-mono text-rose-300 bg-rose-950/80 p-2 rounded-lg border border-rose-900">
                Reason: {settings.maintenanceReason}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMaintenanceOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md cursor-pointer ${
              settings.maintenanceMode
                ? 'bg-emerald-700 hover:bg-emerald-600'
                : 'bg-rose-700 hover:bg-rose-600'
            }`}
          >
            <Power className="w-4 h-4" />
            {settings.maintenanceMode ? 'Lift Maintenance Mode' : 'Trigger Emergency Maintenance'}
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand & Theme */}
          <div className="p-5 rounded-2xl bg-[#12141a] border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Paintbrush className="w-4 h-4 text-[#e53e3e]" />
              Brand & Visual Appearance
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Site / Platform Name</label>
                <input
                  type="text"
                  required
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Primary Maroon Accent Hex</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-zinc-600 shrink-0"
                    style={{ backgroundColor: settings.brandMaroonColor }}
                  />
                  <input
                    type="text"
                    required
                    value={settings.brandMaroonColor}
                    onChange={(e) => setSettings({ ...settings, brandMaroonColor: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-white focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Platform Settlement Currency</label>
                <input
                  type="text"
                  required
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-white focus:outline-none focus:border-[#941b2c]"
                />
              </div>
            </div>
          </div>

          {/* Financial Risk Limits */}
          <div className="p-5 rounded-2xl bg-[#12141a] border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Risk Limits & Liability Thresholds
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Max Bet Limit per Slip (₹)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={settings.maxBetLimit}
                  onChange={(e) => setSettings({ ...settings, maxBetLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-white focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Max Book Exposure per Market (₹)</label>
                <input
                  type="number"
                  required
                  min="50000"
                  value={settings.maxMarketExposure}
                  onChange={(e) => setSettings({ ...settings, maxMarketExposure: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-white focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Dual-Custody Threshold for Voids</label>
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-amber-400">
                  Fixed at ₹2,00,000 (Hardcoded Security Guarantee)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Contact Channels */}
        <div className="p-5 rounded-2xl bg-[#12141a] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <PhoneCall className="w-4 h-4 text-sky-400" />
            Support Channels & Official Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Customer Support Email</label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#941b2c]"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Support Helpline / WhatsApp</label>
              <input
                type="text"
                required
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#941b2c]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#941b2c] hover:bg-[#b92b3f] transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Configurations...' : 'Save All Settings'}
          </button>
        </div>
      </form>

      {/* Maintenance Confirmation Modal */}
      {isMaintenanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#38161b] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Power className="w-5 h-5 text-rose-400" />
                {settings.maintenanceMode ? 'Confirm Lift Maintenance' : 'Confirm Emergency Maintenance Mode'}
              </h3>
              <button onClick={() => setIsMaintenanceOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-zinc-300">
              {settings.maintenanceMode
                ? 'Lifting maintenance mode will restore customer order matching and public traffic on Cricketbuyy.'
                : 'Activating maintenance mode will immediately lock public routes, showing a maintenance screen with your reason.'}
            </p>

            {!settings.maintenanceMode && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Downtime Reason Notice:</label>
                  <textarea
                    rows={2}
                    value={maintenanceReason}
                    onChange={(e) => setMaintenanceReason(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Estimated Downtime: <strong className="text-amber-400">{downtimeMinutes} minutes</strong>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={downtimeMinutes}
                    onChange={(e) => setDowntimeMinutes(Number(e.target.value))}
                    className="w-full accent-[#941b2c] cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
              <button onClick={() => setIsMaintenanceOpen(false)} className="px-4 py-2 text-xs text-zinc-400 hover:text-white">Cancel</button>
              <button
                onClick={handleToggleMaintenance}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm ${
                  settings.maintenanceMode
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-rose-700 hover:bg-rose-600'
                }`}
              >
                {settings.maintenanceMode ? 'Confirm Lift & Resume Trading' : 'Activate Maintenance Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
