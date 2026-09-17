import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JoinProvider } from './context/JoinContext';
import { Home } from './pages/Home';
import { JoinClubPage } from './pages/join/JoinClub';
import { AccountPage } from './pages/join/Account';
import { CharityPage } from './pages/join/Charity';
import { PaymentPage } from './pages/join/Payment';
import { SuccessPage } from './pages/join/Success';
import { Dashboard } from './pages/Dashboard';
import { DrawPage } from './pages/DrawPage';
import { WinningsPage } from './pages/WinningsPage';
import { LoginPage } from './pages/LoginPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDraws } from './pages/admin/AdminDraws';
import { AdminWinners } from './pages/admin/AdminWinners';
import { AdminCharities } from './pages/admin/AdminCharities';
import { AdminDonations } from './pages/admin/AdminDonations';
import { AdminReports } from './pages/admin/AdminReports';

// Scroll restoration helper
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <JoinProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Home />} />

            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* Membership Selection & Join Flow */}
            <Route path="/join" element={<JoinClubPage />} />
            <Route path="/join/account" element={<AccountPage />} />
            <Route path="/join/charity" element={<CharityPage />} />
            <Route path="/join/payment" element={<PaymentPage />} />
            <Route path="/join/success" element={<SuccessPage />} />

            {/* Status-Driven Dashboard (Active Member vs Non-Member) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Feature 1 & 2: Monthly Draw */}
            <Route path="/draw" element={<DrawPage />} />

            {/* Feature 3: My Winnings & Winner Verification */}
            <Route path="/winnings" element={<WinningsPage />} />

            {/* Administrative Control Routes (Protected) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminOverview />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/draws"
              element={
                <AdminRoute>
                  <AdminDraws />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/winners"
              element={
                <AdminRoute>
                  <AdminWinners />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/charities"
              element={
                <AdminRoute>
                  <AdminCharities />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/donations"
              element={
                <AdminRoute>
                  <AdminDonations />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />

            {/* Fallback route back to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </JoinProvider>
    </AuthProvider>
  );
};

export default App;

