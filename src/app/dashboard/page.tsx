import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InternDashboard from '@/components/InternDashboard';
import SupervisorDashboard from '@/components/SupervisorDashboard';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  
  if (session.user.role === 'supervisor') {
    return <SupervisorDashboard user={session.user} />;
  }
  
  return <InternDashboard user={session.user} />;
}