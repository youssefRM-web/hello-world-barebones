import { AdminLayout } from '@/components/AdminPanel/AdminLayout';
import { CustomersPage } from '@/components/AdminPanel/CustomersPage';

export default function AdminCustomers() {
  return (
    <AdminLayout>
      <CustomersPage />
    </AdminLayout>
  );
}
