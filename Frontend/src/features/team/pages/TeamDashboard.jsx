// TeamLead and TeamMember both land here — rendered component differs by role
import { useSelector } from 'react-redux';
import TeamLeadDashboard from '@/features/teamLead/pages/TeamLeadDashboard';
import ResponderDashboard from '@/features/responder/pages/ResponderDashboard';

export default function TeamDashboard() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  if (role === 'teamLead') return <TeamLeadDashboard />;
  if (role === 'teamMember') return <ResponderDashboard />;
  return null;
}