import { Outlet } from 'react-router-dom';
import AppShell from '@/components/layout/app-shell';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <Toaster position="bottom-right" />
    </AppShell>
  );
}
