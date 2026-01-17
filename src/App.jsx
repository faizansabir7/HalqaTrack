import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AreaDetails from './pages/AreaDetails';
import MeetingDetails from './pages/MeetingDetails';
import Admin from './pages/Admin';
import Login from './pages/Login';
import WeeklyReport from './pages/WeeklyReport';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="area/:areaId" element={<AreaDetails />} />
          <Route path="meeting/:meetingId" element={<MeetingDetails />} />
          <Route path="report" element={<WeeklyReport />} />

          <Route path="admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
