/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Monitor,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Send,
  FileCode,
  Globe,
  Sparkles,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStandaloneHtml?: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  onOpenStandaloneHtml,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string>('');

  // Primary share URL (The public Cloud Run pre-release URL)
  const publicShareUrl =
    'https://ais-pre-xkfqx4xqammnxvtli363tl-51977362482.us-east1.run.app';

  // Current active window URL as an instant alternative
  const currentWindowUrl =
    typeof window !== 'undefined' ? window.location.href : publicShareUrl;

  // Selected link to share (defaults to public cloud run URL, or current window if already on pre)
  const defaultUrl =
    typeof window !== 'undefined' && window.location.origin.includes('ais-pre')
      ? window.location.origin
      : publicShareUrl;

  const [activeUrl, setActiveUrl] = useState<string>(defaultUrl);

  if (!isOpen) return null;

  const handleCopyLink = async (urlToCopy: string, type: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = urlToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setCopiedType(type);
      setTimeout(() => {
        setCopied(false);
        setCopiedType('');
      }, 2500);
    } catch {
      setCopied(true);
      setCopiedType(type);
      setTimeout(() => {
        setCopied(false);
        setCopiedType('');
      }, 2500);
    }
  };

  const whatsappMessage = `⚽ Futebas - Acompanhe jogos, placares e lances ao vivo direto no seu navegador:\n${activeUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(activeUrl)}&text=${encodeURIComponent('⚽ Futebas - Futebol Ao Vivo, Tabela e Escalações')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-800 bg-[#070b09] shadow-2xl text-zinc-100 overflow-hidden ring-1 ring-emerald-500/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3 sm:px-6 bg-black/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-[#00ff87] shadow-sm">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2
                id="share-modal-title"
                className="text-base sm:text-lg font-black tracking-tight text-white font-mono flex items-center gap-2"
              >
                <span>COMPARTILHAR COM AMIGOS</span>
                <span className="text-[10px] font-bold text-black bg-[#00ff87] px-2 py-0.5 rounded-full font-mono">
                  AO VIVO
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Funciona em qualquer computador (Chrome, Edge) ou celular (Android / iOS)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-sans">
          {/* Link Principal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Link Oficial para Amigos
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                Sem cadastro • Sem login
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-black border border-emerald-500/40 p-1.5 focus-within:border-emerald-400 transition-colors shadow-inner">
              <input
                type="text"
                readOnly
                value={activeUrl}
                aria-label="Link para compartilhar"
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-emerald-400 font-mono outline-none select-all truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={() => handleCopyLink(activeUrl, 'main')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition-all shrink-0 font-mono ${
                  copied && copiedType === 'main'
                    ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                }`}
              >
                {copied && copiedType === 'main' ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied && copiedType === 'main' ? 'COPIADO!' : 'COPIAR LINK'}</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação Imediata: Abrir e Testar / WhatsApp / Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
            {/* Abrir e Testar Link */}
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 p-2.5 text-zinc-200 font-bold transition-all text-center"
            >
              <ExternalLink className="h-4 w-4 text-emerald-400" />
              <span>Testar Link</span>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-500/50 p-2.5 text-emerald-300 font-bold transition-all text-center"
            >
              <MessageCircle className="h-4 w-4 text-[#00ff87]" />
              <span>Enviar no WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-950/60 hover:bg-sky-950 border border-sky-500/50 p-2.5 text-sky-300 font-bold transition-all text-center"
            >
              <Send className="h-4 w-4 text-sky-400" />
              <span>Telegram</span>
            </a>
          </div>

          {/* Guia: Garantia de Funcionamento no Computador e Celular */}
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-[#00ff87]" />
              <span>COMO GARANTIR QUE SEUS AMIGOS ACESSEM NORMALMENTE:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-zinc-300 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5 bg-black/60 p-3 rounded-lg border border-zinc-800/80">
                <Monitor className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans font-bold">No Computador (PC / Mac)</strong>
                  Basta clicar no link ou colar na barra de endereço do Chrome, Edge, Firefox ou Opera. Abre imediatamente.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-black/60 p-3 rounded-lg border border-zinc-800/80">
                <Smartphone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans font-bold">No Celular (Android / iPhone)</strong>
                  Abre direto pelo WhatsApp ou navegador mobile com layout adaptado para telas de toque.
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/20 p-2.5 text-[11px] text-zinc-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00ff87] shrink-0" />
              <span>
                <strong>Dica:</strong> Seus amigos podem favoritar a aba (<kbd className="bg-black px-1.5 py-0.5 rounded text-white border border-zinc-700">Ctrl+D</kbd>) para consultar resultados de qualquer rodada.
              </span>
            </div>
          </div>

          {/* Opção Alternativa: Arquivo Standalone 100% Offline */}
          {onOpenStandaloneHtml && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black border border-zinc-800 text-zinc-300">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Quer rodar como arquivo no seu PC?</span>
                  <span className="text-[11px] text-zinc-400">Gera um arquivo único .html que abre em qualquer computador sem precisar de internet ou servidor.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStandaloneHtml();
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-black text-xs font-bold text-white transition-all font-mono shrink-0 ml-3"
              >
                BAIXAR HTML
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/90 px-4 py-2.5 bg-black/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Futebas v2.0 • Compartilhamento Direto
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition-colors font-mono"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
