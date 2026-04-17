import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            OJT DTR System
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">Hi, {session.user.name}</span>
            <Link 
              href="/dashboard/settings"
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}