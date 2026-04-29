import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from '../i18n/useI18n.ts';
import { fetchAiConfig, type AiConfigResponse } from '../lib/ai.ts';
import {
  AI_BUILD_FLAG,
  EXPLAIN_BUILD_FLAG,
  useUiPrefsStore,
} from '../store/prefs.ts';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: Props) {
  const t = useTranslations();
  const { explainEnabled, setExplainEnabled, aiTestModeEnabled, setAiTestModeEnabled } =
    useUiPrefsStore();
  const headingId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [aiServer, setAiServer] = useState<AiConfigResponse | null>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    fetchAiConfig().then((cfg) => {
      if (mounted) setAiServer(cfg);
    });
    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const aiServerEnabled = aiServer?.enabled === true;
  const aiAvailable = AI_BUILD_FLAG && aiServerEnabled;

  return (
    <div
      className="fixed inset-0 z-40 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label={t.settings.close}
        className="flex-1 bg-slate-900/40"
        onClick={onClose}
      />
      <aside className="w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 id={headingId} className="text-xl font-bold text-industrial-primary">
            {t.settings.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-xl2 bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
          >
            {t.settings.close}
          </button>
        </div>

        <section className="mt-6 rounded-xl2 border border-slate-200 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-industrial-accent"
              checked={explainEnabled}
              disabled={!EXPLAIN_BUILD_FLAG}
              onChange={(e) => setExplainEnabled(e.target.checked)}
            />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-industrial-primary">
                {t.settings.explainToggleLabel}
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {t.settings.explainToggleDesc}
              </span>
              {!EXPLAIN_BUILD_FLAG && (
                <span className="mt-2 block text-xs text-industrial-warning">
                  {t.settings.explainDisabledByDeploy}
                </span>
              )}
            </span>
          </label>
        </section>

        <section className="mt-4 rounded-xl2 border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-industrial-primary">
            {t.settings.aiSectionTitle}
          </h3>
          <label className="mt-3 flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-industrial-accent"
              checked={aiTestModeEnabled && aiAvailable}
              disabled={!aiAvailable}
              onChange={(e) => setAiTestModeEnabled(e.target.checked)}
            />
            <span className="flex-1">
              <span className="block text-sm font-semibold text-industrial-primary">
                {t.settings.aiToggleLabel}
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {t.settings.aiToggleDesc}
              </span>
              {!aiAvailable && (
                <span className="mt-2 block text-xs text-industrial-warning">
                  {t.settings.aiDisabledByDeploy}
                </span>
              )}
              {aiAvailable && aiServer?.model && (
                <span className="mt-2 block text-xs text-slate-500">
                  {t.settings.aiModelLabel}: <code>{aiServer.model}</code>{' '}
                  <em>{t.ai.poweredBy}</em>
                </span>
              )}
              {aiAvailable && (
                <span className="mt-2 block text-xs text-industrial-warning">
                  {t.settings.aiWarning}
                </span>
              )}
            </span>
          </label>
        </section>

        <p className="mt-4 text-xs text-slate-500">{t.settings.communityNote}</p>
      </aside>
    </div>
  );
}
