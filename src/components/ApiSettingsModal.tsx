/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Key, CheckCircle, Info, ExternalLink, Zap, Globe, ShieldCheck } from 'lucide-react';
import { ApiConfig } from '../services/soccerApi.ts';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (newConfig: ApiConfig) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [provider, setProvider] = useState<ApiConfig['provider']>(config.provider);
  const [rapidApiKey, setRapidApiKey] = useState<string>(config.rapidApiKey || '');
  const [pollIntervalSec, setPollIntervalSec] = useState<number>(config.pollIntervalSec);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      provider,
      rapidApiKey: rapidApiKey.trim(),
      pollIntervalSec,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#090d0b] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 text-[#00ff87] mb-1">
          <Key className="h-5 w-5" />
          <h2 id="api-modal-title" className="text-lg font-bold text-white font-mono">
            Configurações da API de Futebol
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Escolha a fonte de dados para carregar jogos, placares e autores dos gols.
        </p>

        {/* Provider Selection */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Provedor da API:
          </label>

          {/* Option C: ESPN (Default) */}
          <div
            onClick={() => setProvider('espn')}
            className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
              provider === 'espn'
                ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40'
                : 'border-zinc-800 bg-black/60 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Zap className="h-5 w-5 text-[#00ff87] shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Opção C: ESPN Public API</span>
                    <span className="text-[10px] bg-emerald-500/20 text-[#00ff87] px-2 py-0.5 rounded-full font-bold font-mono">
                      Recomendada • Sem Chave
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Funciona imediatamente sem necessidade de cadastro, cartão ou chave de API. Suporta Champions League e Brasileirão com autores de gols, estatísticas e cartões.
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={provider === 'espn'}
                onChange={() => setProvider('espn')}
                className="mt-1 h-4 w-4 text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Option A: API-FOOTBALL (RapidAPI) */}
          <div
            onClick={() => setProvider('rapidapi')}
            className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
              provider === 'rapidapi'
                ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40'
                : 'border-zinc-800 bg-black/60 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Opção A: API-FOOTBALL (RapidAPI)</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-bold font-mono">
                      100 req/dia grátis
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    API especializada via RapidAPI com cobertura mundial de ligas e eventos ao vivo detalhados.
                  </p>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={provider === 'rapidapi'}
                onChange={() => setProvider('rapidapi')}
                className="mt-1 h-4 w-4 text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* RapidAPI Key Input if selected */}
        {provider === 'rapidapi' && (
          <div className="mb-5 rounded-xl bg-slate-950/80 p-3.5 ring-1 ring-slate-800 border-l-2 border-emerald-500">
            <label
              htmlFor="rapidapi-key-input"
              className="block text-xs font-semibold text-slate-200 mb-1"
            >
              Cole sua RapidAPI Key aqui (x-rapidapi-key):
            </label>
            <input
              id="rapidapi-key-input"
              type="password"
              value={rapidApiKey}
              onChange={(e) => setRapidApiKey(e.target.value)}
              placeholder="Ex: 8f3b2a9e1c0d4567..."
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-mono text-white border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Como obter uma chave gratuita:</span>
              <a
                href="https://rapidapi.com/api-sports/api/api-football"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
              >
                <span>Acessar RapidAPI</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Polling Interval */}
        <div className="mb-6">
          <label
            htmlFor="poll-interval-select"
            className="block text-xs font-semibold text-slate-300 mb-1.5"
          >
            Intervalo de Polling Automático (Jogos Ao Vivo):
          </label>
          <select
            id="poll-interval-select"
            value={pollIntervalSec}
            onChange={(e) => setPollIntervalSec(Number(e.target.value))}
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value={15}>A cada 15 segundos (Mais rápido)</option>
            <option value={30}>A cada 30 segundos (Recomendado pelo projeto)</option>
            <option value={60}>A cada 60 segundos (Econômico)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <span>Salvar Configuração</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
