// src/pages/Dashboard.jsx
import { Route, Routes } from 'react-router-dom';

import DashboardLayout from '../components/layouts/DashboardLayout';

import Alertes from './dashboard/alerte';
import Documents from './dashboard/documents';
import Historique from './dashboard/historique';
import Overview from './dashboard/overview';
import Projets from './dashboard/projets';
import Reserves from './dashboard/reserves';
import Utilisateurs from './dashboard/utilisateurs';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/reserves" element={<Reserves />} />
        <Route path="/alertes" element={<Alertes />} />
        <Route path="/projets" element={<Projets />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/utilisateurs" element={<Utilisateurs />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
