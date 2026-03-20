import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/take-test', label: 'Take Test', icon: '🧪' },
    { path: '/topics', label: 'Topic Intelligence', icon: '🧠' },
    { path: '/mistakes', label: 'Mistake Report', icon: '🔁' },
    { path: '/study-plan', label: 'Study Plan', icon: '📚' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/tests', label: 'Test History', icon: '📝' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isMobile = useMediaQuery('(max-width: 768px)');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const onToggle = () => setSidebarOpen(v => !v);
        const onClose = () => setSidebarOpen(false);

        window.addEventListener('sidebar:toggle', onToggle);
        window.addEventListener('sidebar:close', onClose);
        return () => {
            window.removeEventListener('sidebar:toggle', onToggle);
            window.removeEventListener('sidebar:close', onClose);
        };
    }, []);

    useEffect(() => {
        if (!isMobile) return;
        // Close after route change without triggering React's "setState in effect body" lint.
        queueMicrotask(() => setSidebarOpen(false));
    }, [location.pathname, isMobile]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 75,
                        background: 'rgba(0,0,0,0.45)',
                    }}
                />
            )}

            <aside style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                width: 260, background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-glass)',
                display: 'flex', flexDirection: 'column',
                zIndex: isMobile ? 80 : 50,
                transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
                transition: 'transform 0.2s ease',
            }}>
                {/* Logo */}
                <div style={{
                    padding: '24px 20px', borderBottom: '1px solid var(--border-glass)',
                }}>
                    <div style={{
                        fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
                    }}>
                        <span className="gradient-text">ScoreScope</span>
                        <span style={{ color: 'var(--text-primary)' }}> AI</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        AI-Powered Performance Insights
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', marginBottom: 4,
                                borderRadius: 12, textDecoration: 'none',
                                fontSize: 14, fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent',
                                transition: 'all 0.2s ease',
                            })}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User profile */}
                <div style={{
                    padding: '16px 16px', borderTop: '1px solid var(--border-glass)',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 12,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700,
                        }}>
                            {user?.first_name?.[0] || user?.username?.[0] || '?'}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                                {user?.first_name || user?.username}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {user?.target_exam || 'Student'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 8, color: '#fca5a5',
                            fontSize: 13, cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
