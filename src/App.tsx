import { useState } from 'react';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import SupervisorView from './components/supervisor/SupervisorView';
import AgentView from './components/agent/AgentView';
import AdminView from './components/admin/AdminView';
import type { UserRole } from './data/mockData';

interface User {
  role: UserRole;
  name: string;
}

const roleTitles: Record<UserRole, string> = {
  supervisor: 'Tableau de bord superviseur',
  agent: 'Mes missions terrain',
  admin: 'Panneau d\'administration',
};

const roleSubtitles: Record<UserRole, string> = {
  supervisor: 'Douala · Zones à risque · Profils clients',
  agent: 'Liste des clients assignés · Vérification terrain',
  admin: 'Contrôle total · Activités · Assignations',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <LoginPage onLogin={(role, name) => setUser({ role, name })} />;
  }

  return (
    <Layout
      userName={user.name}
      userRole={user.role}
      onLogout={() => setUser(null)}
      title={roleTitles[user.role]}
      subtitle={roleSubtitles[user.role]}
    >
      {user.role === 'supervisor' && <SupervisorView />}
      {user.role === 'agent' && <AgentView userName={user.name} />}
      {user.role === 'admin' && <AdminView />}
    </Layout>
  );
}
