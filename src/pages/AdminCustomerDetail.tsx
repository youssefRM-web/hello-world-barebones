import { AdminLayout } from '@/components/AdminPanel/AdminLayout';
import { CustomerDetailPage } from '@/components/AdminPanel/CustomerDetailPage';

export default function AdminCustomerDetail() {
  return (
    <AdminLayout>
      <CustomerDetailPage />
    </AdminLayout>
  );
}
