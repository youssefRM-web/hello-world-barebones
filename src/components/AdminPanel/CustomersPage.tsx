import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Building, Users, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganizationDashboardQuery, type OrganizationDashboard } from '@/hooks/queries/useOrganizationDashboardQuery';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export interface Company {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'trial';
  activeUsers: number;
  totalTickets: number;
  totalRevenue: number;
  subscriptionStatus: string;
  companyEmail: string;
}

// Transform API data to Company format
const transformToCompany = (org: OrganizationDashboard): Company => ({
  id: org._id,
  name: org.name,
  status: org.subscription.status === 'active' ? 'active' : org.subscription.status === 'trial' ? 'trial' : 'inactive',
  activeUsers: org.activeUsers,
  totalTickets: org.totalTickets,
  totalRevenue: org.billingAndPayment.totalRevenue,
  subscriptionStatus: org.subscription.status,
  companyEmail: org.companyDetails.email,
});

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'revenue'>('newest');

  const { data: organizations = [], isLoading, error } = useOrganizationDashboardQuery();

  const companies = organizations.map(transformToCompany);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.companyEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'oldest':
        return a.id.localeCompare(b.id);
      case 'newest':
      default:
        return b.id.localeCompare(a.id);
    }
  });

  const getSortLabel = () => {
    switch (sortBy) {
      case 'revenue': return 'Highest Revenue';
      case 'oldest': return 'Oldest First';
      default: return 'Newest First';
    }
  };

  const getStatusBadge = (status: Company['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'trial':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Trial</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Inactive</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">Failed to load companies. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
        <p className="text-muted-foreground">Manage your client organizations and their admins</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Showing {sortedCompanies.length} companies
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                Sort by: <span className="font-medium">{getSortLabel()}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('revenue')}>Highest Revenue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Company Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active Users</TableHead>
              <TableHead className="text-center">Total Tickets</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              sortedCompanies.map((company) => (
                <TableRow 
                  key={company.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/customers/${company.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">{company.name}</span>
                        <p className="text-xs text-muted-foreground">{company.companyEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(company.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{company.activeUsers}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{company.totalTickets}</TableCell>
                  <TableCell className="text-right">€{company.totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}