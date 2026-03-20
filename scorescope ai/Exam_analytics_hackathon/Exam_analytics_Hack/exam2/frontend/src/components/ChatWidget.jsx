import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatWidget() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { user } = useAuth();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const endRef = useRef(null);

    const initialHint = useMemo(() => {
        const name = user?.first_name || user?.username || 'there';
        return `Hi ${name}! Ask me what to study next, or why you missed certain topics.`;
    }, [user]);

    useEffect(() => {
        if (open && messages.length === 0) {
            setMessages([
                { id: uid(), role: 'assistant', content: initialHint },
            ]);
        }
    }, [open, messages.length, initialHint]);

    useEffect(() => {
        if (!open) return;
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, open]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        setLoading(true);

        setMessages(prev => [
            ...prev,
            { id: uid(), role: 'user', content: text },
        ]);

        const historyForApi = messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await API.post('/chat/', { message: text, history: historyForApi });
            const assistant = (res.data && res.data.response) ? res.data.response : 'Got it.';
            setMessages(prev => [
                ...prev,
                { id: uid(), role: 'assistant', content: assistant },
            ]);
        } catch (err) {
            const errMsg = err?.response?.data?.error
                || err?.response?.data?.detail
                || err?.message
                || "Couldn't connect. Check your connection and try again.";
            setMessages(prev => [
                ...prev,
                { id: uid(), role: 'assistant', content: `Error: ${errMsg}` },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleOpen = () => setOpen(v => !v);

    return (
        <>
            {/* Floating button */}
            {!open && (
                <button
                    onClick={toggleOpen}
                    style={{
                        position: 'fixed',
                        right: 18,
                        bottom: isMobile ? 92 : 22,
                        zIndex: 200,
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(17,24,39,0.65)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 18px 48px rgba(0,0,0,0.35)',
                    }}
                    title="Study Companion"
                >
                    <div className="gradient-text" style={{ fontSize: 20, fontWeight: 900, lineHeight: '56px' }}>
                        AI
                    </div>
                </button>
            )}

            {/* Chat panel */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        right: 12,
                        bottom: isMobile ? 72 : 18,
                        zIndex: 200,
                        width: isMobile ? 'calc(100vw - 24px)' : 380,
                        height: isMobile ? '70vh' : 520,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 18,
                        overflow: 'hidden',
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(17,24,39,0.78)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 22px 72px rgba(0,0,0,0.45)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-glass)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 12,
                                background: 'rgba(139,92,246,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900,
                            }}>
                                AI
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800 }}>Study Companion</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Personalized by memory</div>
                            </div>
                        </div>

                        <button
                            onClick={toggleOpen}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'white',
                                borderRadius: 10,
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                            aria-label="Close chat"
                        >
                            Close
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        padding: '14px',
                        flex: 1,
                        overflowY: 'auto',
                    }}>
                        {messages.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ask a question to begin.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {messages.map(m => (
                                    <div
                                        key={m.id}
                                        style={{
                                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '92%',
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: 14,
                                                background: m.role === 'user' ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.10)',
                                                whiteSpace: 'pre-wrap',
                                                fontSize: 13,
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Typing…</div>
                                )}
                                <div ref={endRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: 12,
                        borderTop: '1px solid var(--border-glass)',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-end',
                    }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about weak topics, next steps, revision..."
                            rows={isMobile ? 1 : 2}
                            style={{
                                flex: 1,
                                resize: 'none',
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: 14,
                                padding: '10px 12px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: 13,
                                lineHeight: 1.4,
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 14,
                                border: 'none',
                                background: loading || !input.trim() ? 'rgba(255,255,255,0.08)' : 'var(--gradient-primary)',
                                color: 'white',
                                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                fontWeight: 900,
                                fontSize: 13,
                                minWidth: 86,
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

