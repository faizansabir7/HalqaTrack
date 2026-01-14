import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AreaDetails from './pages/AreaDetails';
import MeetingDetails from './pages/MeetingDetails';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="area/:areaId" element={<AreaDetails />} />
          <Route path="meeting/:meetingId" element={<MeetingDetails />} />
          <Route path="admin" element={<Admin />} />
          {/* Detailed tracking routes will go here */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
