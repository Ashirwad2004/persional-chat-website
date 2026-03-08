import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useChatStore } from './store/chatStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  const summaries = useChatStore(state => state.summaries);

  useEffect(() => {
    // Calculate global unread count
    const totalUnread = Object.values(summaries).reduce((sum, summary) => sum + (summary.unread_count || 0), 0);

    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Chat App`;
    } else {
      document.title = `Chat App`;
    }
  }, [summaries]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;