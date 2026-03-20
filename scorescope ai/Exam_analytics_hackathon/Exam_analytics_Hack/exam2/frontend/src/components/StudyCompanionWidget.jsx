import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import useMediaQuery from '../hooks/useMediaQuery';

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function StudyCompanionWidget() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { user } = useAuth();

    const [open, setOpen] = useState(false);

    // Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const endRef = useRef(null);

    const initialHint = useMemo(() => {
        const name = user?.first_name || user?.username || 'there';
        return `Hi ${name}! I'm your AI Study Companion. Ask me questions about your weak topics!`;
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
        if (!text || loadingChat) return;

        setInput('');
        setLoadingChat(true);

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
            const errMsg = err?.response?.data?.error || "Couldn't connect.";
            setMessages(prev => [
                ...prev,
                { id: uid(), role: 'assistant', content: `Error: ${errMsg}` },
            ]);
        } finally {
            setLoadingChat(false);
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
                        background: 'rgba(17,24,39,0.8)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 18px 48px rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    title="ScoreScope AI Chat"
                >
                    <div className="gradient-text" style={{ fontSize: 20, fontWeight: 900 }}>
                        AI
                    </div>
                </button>
            )}

            {/* Main panel */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        right: 12,
                        bottom: isMobile ? 72 : 18,
                        zIndex: 200,
                        width: isMobile ? 'calc(100vw - 24px)' : 380,
                        height: isMobile ? '75vh' : 540,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 18,
                        overflow: 'hidden',
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(17,24,39,0.85)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 22px 72px rgba(0,0,0,0.5)',
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
                                ✨
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800 }}>ScoreScope AI</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-powered study chat</div>
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
                        >
                            Close
                        </button>
                    </div>

                    {/* Chat Content */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {messages.map(m => (
                                    <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                                        <div style={{
                                            padding: '10px 12px',
                                            borderRadius: 14,
                                            background: m.role === 'user' ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.10)',
                                            whiteSpace: 'pre-wrap',
                                            fontSize: 13,
                                            color: 'var(--text-primary)',
                                        }}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {loadingChat && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Typing…</div>}
                                <div ref={endRef} />
                            </div>
                        </div>
                        <div style={{ padding: 12, borderTop: '1px solid var(--border-glass)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about weak topics..."
                                rows={isMobile ? 1 : 2}
                                style={{
                                    flex: 1, resize: 'none', background: 'var(--bg-glass)',
                                    border: '1px solid var(--border-glass)', borderRadius: 14,
                                    padding: '10px 12px', color: 'var(--text-primary)',
                                    outline: 'none', fontSize: 13, lineHeight: 1.4,
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                                }}
                                disabled={loadingChat}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loadingChat || !input.trim()}
                                style={{
                                    padding: '10px 14px', borderRadius: 14, border: 'none',
                                    background: loadingChat || !input.trim() ? 'rgba(255,255,255,0.08)' : 'var(--gradient-primary)',
                                    color: 'white', cursor: loadingChat || !input.trim() ? 'not-allowed' : 'pointer',
                                    fontWeight: 900, fontSize: 13, minWidth: 86,
                                }}
                            >Send</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
