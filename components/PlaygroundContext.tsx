"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBrainia } from '@/context/BrainiaContext';
import { useSession } from 'next-auth/react';
import i18n from './ui/i18n';

type Message = { role: string; text: string };

type PlaygroundContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  isTyping: boolean;
  clearHistory: () => void;
  testAgentId: string | null;
  setTestAgentId: (v: string | null) => void;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
};

const PlaygroundContext = createContext<PlaygroundContextType | null>(null);

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
  const { activeAgent } = useBrainia();
  const { data: session, status: sessionStatus } = useSession();
  const testAgentKey = 'playground_test_agent';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: i18n.defaultAssistantGreeting }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [testAgentId, setTestAgentIdState] = useState<string | null>(() => {
    try { return localStorage.getItem(testAgentKey); } catch { return null; }
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const MAX_MESSAGES = 200;

  const storageKey = `playground_messages_${activeAgent?.id || testAgentId || 'global'}`;

  useEffect(() => {
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && typeof detail.open === 'boolean') setIsOpen(Boolean(detail.open));
    };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'playground_open') setIsOpen(ev.newValue === 'true');
    };
    window.addEventListener('togglePlayground', onToggle as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('togglePlayground', onToggle as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // load messages for current agent/testAgentId
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_MESSAGES));
      }
    } catch (err) {
      console.warn('No se pudo cargar historial del playground:', err);
    }
  }, [storageKey, activeAgent?.id]);

  // persist messages
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_MESSAGES))); } catch (e) { /* no-op */ }
    }, 800);
    return () => clearTimeout(t);
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const open = () => {
    setIsOpen(true);
    try { localStorage.setItem('playground_open', 'true'); } catch {}
  };
  const close = () => {
    setIsOpen(false);
    try { localStorage.setItem('playground_open', 'false'); } catch {}
  };

  const clearHistory = () => {
    setMessages([{ role: 'assistant', text: i18n.defaultAssistantGreeting }]);
    try { localStorage.removeItem(storageKey); } catch {}
    toast.success(i18n.historyCleared);
  };

  const setTestAgentId = (v: string | null) => {
    try { if (v) localStorage.setItem(testAgentKey, v); else localStorage.removeItem(testAgentKey); } catch {}
    setTestAgentIdState(v);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const current = [...messages, { role: 'user', text: userMsg }];
    setMessages(current);
    setInput('');
    setIsTyping(true);

    try {
      const apiMessages = current.map(m => ({ role: m.role, content: m.text }));
      const req = [{ role: 'system', content: activeAgent?.systemPrompt || 'Eres un asistente.' }, ...apiMessages];

      const agentIdToUse = activeAgent?.id || testAgentId;
      // If no agent and no authenticated session, use demo mode
      const isDemo = !agentIdToUse || sessionStatus !== 'authenticated';

      const payload: any = {
        messages: req,
        provider: activeAgent?.config?.aiProvider || 'openai',
        stream: false,
      };
      if (isDemo) {
        payload.isDemo = true;
        payload.demoContext = activeAgent?.businessDescription || '';
      } else {
        payload.agentId = agentIdToUse;
      }

      let res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      // If missing agentId in private mode, retry automatically as demo once
      if (!res.ok) {
        let body: any = null;
        try { body = await res.json(); } catch {}
        const errMsg = body?.error || `Error ${res.status}`;

        if (res.status === 400 && /agentId/i.test(String(errMsg)) && !payload.isDemo) {
          // retry as demo
          const demoPayload = { ...payload, isDemo: true };
          delete demoPayload.agentId;
          const retryRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(demoPayload),
          });

          if (!retryRes.ok) {
            let retryBody: any = null;
            try { retryBody = await retryRes.json(); } catch {}
            const retryErr = retryBody?.error || `Error ${retryRes.status}`;
            setMessages(prev => [...prev, { role: 'assistant', text: i18n.errorContact }]);
            toast.error(retryErr);
            return;
          }

          const retryData = await retryRes.json().catch(() => ({}));
          setMessages(prev => [...prev, { role: 'assistant', text: (retryData.content || retryData.message || i18n.emptyResponse) }]);
          return;
        }

        // Other non-ok
        setMessages(prev => [...prev, { role: 'assistant', text: i18n.errorContact }]);
        toast.error(errMsg);
        return;
      }

      const data = await res.json().catch(() => ({}));
      setMessages(prev => [...prev, { role: 'assistant', text: (data.content || data.message || i18n.emptyResponse) }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: i18n.errorContact }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PlaygroundContext.Provider value={{ isOpen, open, close, messages, input, setInput, isTyping, clearHistory, testAgentId, setTestAgentId, sendMessage }}>
      {children}
      <div style={{ display: 'none' }} ref={messagesEndRef} />
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlayground must be used within PlaygroundProvider');
  return ctx;
}



