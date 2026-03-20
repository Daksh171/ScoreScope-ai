import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import StudyCompanionWidget from './components/StudyCompanionWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TopicIntelligence from './pages/TopicIntelligence';
import MistakeReport from './pages/MistakeReport';
import StudyPlan from './pages/StudyPlan';
import Progress from './pages/Progress';
import TestAnalytics from './pages/TestAnalytics';
import TakeTest from './pages/TakeTest';
import TestReview from './pages/TestReview';
import './index.css';
import useMediaQuery from './hooks/useMediaQuery';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="gradient-text" style={{ fontSize: 24, fontWeight: 700 }}>Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 70,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
        }}>
          <button
            onClick={() => window.dispatchEvent(new Event('sidebar:toggle'))}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: 18,
            }}
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="gradient-text" style={{ fontSize: 14, fontWeight: 900 }}>
              ScoreScope AI
            </div>
          </div>

          <div style={{ width: 40 }} />
        </div>
      )}

      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 260,
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          paddingTop: isMobile ? 56 : 0,
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topics" element={<TopicIntelligence />} />
          <Route path="/mistakes" element={<MistakeReport />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/tests" element={<TestAnalytics />} />
          <Route path="/take-test" element={<TakeTest />} />
          <Route path="/test-review/:testId" element={<TestReview />} />
        </Routes>
      </main>

      <StudyCompanionWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
