import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CateringDashboard from './pages/dashboard/CateringDashboard';
import CoachDashboard from './pages/dashboard/CoachDashboard';

import RefereeDashboard from './pages/dashboard/RefereeDashboard';
import MediaDashboard from './pages/dashboard/MediaDashboard';
import FanZoneDashboard from './pages/dashboard/FanZoneDashboard';
import FieldManagerDashboard from './pages/dashboard/FieldManagerDashboard';
import PhotographerDashboard from './pages/dashboard/PhotographerDashboard';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import Venues from './pages/Venues';
import NFCCheckIn from './pages/NFCCheckIn';

function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'manager':
      return <ManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'catering':
      return <CateringDashboard />;
    case 'team':
      return <CoachDashboard />;

    case 'referee':
      return <RefereeDashboard />;
    case 'media':
      return <MediaDashboard />;
    case 'fanzone':
      return <FanZoneDashboard />;
    case 'fieldmanager':
      return <FieldManagerDashboard />;
    case 'photographer':
      return <PhotographerDashboard />;
    default:
      return <FanZoneDashboard />;
  }
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    // Role-specific tab routing
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
        case 'register-teams':
          return <AdminDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    if (user?.role === 'catering') {
      return <CateringDashboard />;
    }



    if (user?.role === 'team') {
      switch (activeTab) {
        case 'dashboard':
        case 'shop':
          return <CoachDashboard />;
        case 'matches':
          return <Matches />;
        case 'teams':
          return <Teams />;
        case 'venues':
          return <Venues />;
        case 'nfc':
          return <NFCCheckIn />;
        default:
          return <CoachDashboard />;
      }
    }

    if (user?.role === 'referee') {
      switch (activeTab) {
        case 'dashboard':
          return <RefereeDashboard />;
        case 'matches':
          return <Matches />;
        case 'teams':
          return <Teams />;
        case 'venues':
          return <Venues />;
        default:
          return <RefereeDashboard />;
      }
    }

    if (user?.role === 'media') {
      switch (activeTab) {
        case 'dashboard':
        case 'photos':
        case 'press':
          return <MediaDashboard />;
        case 'matches':
          return <Matches />;
        case 'teams':
          return <Teams />;
        case 'venues':
          return <Venues />;
        case 'media':
          return <MediaDashboard />;
        default:
          return <MediaDashboard />;
      }
    }

    if (user?.role === 'fanzone') {
      switch (activeTab) {
        case 'dashboard':
        case 'shop':
          return <FanZoneDashboard />;
        case 'matches':
          return <Matches />;
        case 'teams':
          return <Teams />;
        case 'venues':
          return <Venues />;
        default:
          return <FanZoneDashboard />;
      }
    }

    if (user?.role === 'fieldmanager') {
      return <FieldManagerDashboard />;
    }

    if (user?.role === 'photographer') {
      return <PhotographerDashboard />;
    }

    // Manager and default
    switch (activeTab) {
      case 'dashboard':
      case 'admin':
        return <ManagerDashboard />;
      case 'matches':
        return <Matches />;
      case 'teams':
        return <Teams />;
      case 'venues':
        return <Venues />;
      case 'nfc':
        return <NFCCheckIn />;
      case 'media':
        return <MediaDashboard />;
      default:
        return <DashboardRouter />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
