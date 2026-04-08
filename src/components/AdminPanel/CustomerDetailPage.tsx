import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  Search,
  Check,
  MapPin,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganizationDashboardQuery } from "@/hooks/queries/useOrganizationDashboardQuery";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import PricingPlansSection from "./PricingPlansSection";
import { format } from "date-fns";

type CompanyDetailSection = "general" | "pricingPlans" | "subscription" | "billing" | "invoices";

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticketSearch, setTicketSearch] = useState("");
  const [companySection, setCompanySection] =
    useState<CompanyDetailSection>("general");

  const {
    data: organizations = [],
    isLoading,
    error,
  } = useOrganizationDashboardQuery();

  const company = organizations.find((c) => c._id === id);

  // Dummy ticket data since API doesn't return actual ticket details
  const dummyTickets = [
    {
      id: "19315",
      title: "Problem with creating a ticket",
      description:
        "I can't seem to create a new ticket when I'm on the mobile view. The button is overlapping.",
      user: "Alice Johnson",
      priority: "High",
      status: "Open",
      date: "2025-12-06",
    },
    {
      id: "19289",
      title: "Dashboard loading slowly",
      description:
        "The dashboard takes too long to load when there are many assets.",
      user: "Bob Smith",
      priority: "Medium",
      status: "Closed",
      date: "2025-12-04",
    },
  ];

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
        <p className="text-destructive">
          Failed to load company details. Please try again.
        </p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8">
        <p>Company not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      case "trial":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Trial
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-500 border-gray-200"
          >
            Inactive
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            {status}
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-600 border-orange-200"
          >
            ⊙ High
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-600 border-yellow-200"
          >
            ⊙ Medium
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-600 border-gray-200"
          >
            ⊙ Low
          </Badge>
        );
    }
  };

  const stats = [
    {
      label: "Active Users",
      value: company.activeUsers.toString(),
      icon: <Users className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: `€${company.billingAndPayment.totalRevenue.toLocaleString()}`,
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50",
    },
    {
      label: "Total Tickets",
      value: company.totalTickets.toString(),
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      bgColor: "bg-purple-50",
    },
    {
      label: "Paid Invoices",
      value: company.billingAndPayment.totalPaidPayments.toString(),
      icon: <FileText className="h-5 w-5 text-orange-500" />,
      bgColor: "bg-orange-50",
    },
  ];

  const filteredTickets = dummyTickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.description.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  const planPrice =
    company.subscription.currentPlan === "Professional"
      ? 12
      : company.subscription.currentPlan === "Basic"
      ? 9
      : 0;

  const planFeatures =
    company.subscription.currentPlan === "Professional"
      ? ["Everything in Basic", "Smart analytics", "24/7 Chat support"]
      : ["Basic features", "Email support", "5 users included"];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/customers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Building className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{company.activeUsers} Users</span>
            <span>•</span>
            {getStatusBadge(company.subscription.status)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b border-border rounded-none p-0 h-auto">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Users & Admins
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Ticket History
          </TabsTrigger>
          <TabsTrigger
            value="company"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            Company Details
          </TabsTrigger>
        </TabsList>

        {/* Users & Admins Tab */}
        <TabsContent value="users">
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Tickets Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.ticketsCreatedByMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  company.ticketsCreatedByMembers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.profile_picture}
                              alt={`${user.name} profile picture`}
                            />
                            <AvatarFallback className="bg-[#0F4C7BFF] text-white uppercase">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {user.ticketsCreated}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Ticket History Tab */}
        <TabsContent value="tickets">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">All Company Tickets</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start gap-3 p-4 border border-border rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          #{ticket.id} {ticket.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(ticket.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px] bg-purple-100 text-purple-600">
                              {ticket.user
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.user}</span>
                        </div>
                        {getPriorityBadge(ticket.priority)}
                        <span className="text-sm text-muted-foreground">
                          • {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Details Tab */}
        <TabsContent value="company">
          <Card>
            <CardContent className="p-0">
              <div className="flex">
                {/* Sidebar */}
                <div className="w-[200px] border-r border-border p-2">
                  <button
                    onClick={() => setCompanySection("general")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      companySection === "general"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setCompanySection("pricingPlans")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      companySection === "pricingPlans"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    Pricing Plans
                  </button>
                  <button
                    onClick={() => setCompanySection("subscription")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      companySection === "subscription"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    Subscription
                  </button>
                  <button
                    onClick={() => setCompanySection("billing")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      companySection === "billing"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    Billing & Payment
                  </button>
                  <button
                    onClick={() => setCompanySection("invoices")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      companySection === "invoices"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    Invoices
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  {/* General Section */}
                  {companySection === "general" && (
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Business Information
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        View company details and contact information.
                      </p>

                      <div className="border border-border rounded-lg p-6">
                        <div className="grid grid-cols-2 gap-y-6">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Company Name
                            </p>
                            <p className="font-medium">
                              {company.companyDetails.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Email
                            </p>
                            <p className="font-medium">
                              {company.companyDetails.email}
                            </p>
                          </div>
                          {/* <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Business Type</p>
                            <p className="font-medium first-letter:uppercase">{company.companyDetails.businessType}</p>
                          </div> */}
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Country
                            </p>
                            <p className="font-medium first-letter:uppercase">
                              {company.companyDetails.country}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Telephone
                            </p>
                            <p className="font-medium">
                              {company.companyDetails.telephone}
                            </p>
                          </div>
                          <div className="font-medium">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Address
                            </p>
                            <p className="font-medium">
                              {company.companyDetails.address}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              City
                            </p>
                            <p className="font-medium">
                              {company.companyDetails.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Zip Code
                            </p>
                            <p className="font-medium">
                              {company.companyDetails.zip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Section */}
                  {companySection === "subscription" && (
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Subscription Plan
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Manage your current subscription and billing cycle.
                      </p>

                      <div className="border-2 border-primary rounded-lg p-6 max-w-md relative">
                        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>

                        <h4 className="font-semibold text-xl text-primary mb-1">
                          {company.subscription.currentPlan || "Trial"}
                        </h4>
                        <p className="text-2xl font-bold text-primary mb-4">
                          €{planPrice}{" "}
                          <span className="text-base font-normal text-muted-foreground">
                            /month
                          </span>
                        </p>

                        <Button
                          className="w-full mb-2"
                          variant="outline"
                          disabled
                        >
                          Current Plan
                        </Button>
                        <Button
                          variant="link"
                          className="w-full text-red-500 hover:text-red-600"
                        >
                          Cancel Subscription
                        </Button>

                        <div className="border border-border rounded-lg p-4 mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Start date
                            </span>
                            <span className="font-medium">
                              {format(
                                new Date(company.subscription.startDate),
                                "dd.MM.yyyy"
                              )}
                            </span>
                          </div>
                          {company.subscription.nextBillingDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Next payment
                              </span>
                              <span className="font-medium">
                                {format(
                                  new Date(
                                    company.subscription.nextBillingDate
                                  ),
                                  "dd.MM.yyyy"
                                )}
                              </span>
                            </div>
                          )}
                          {company.subscription.trialEndDate &&
                            !company.subscription.nextBillingDate && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Trial ends
                                </span>
                                <span className="font-medium">
                                  {format(
                                    new Date(company.subscription.trialEndDate),
                                    "dd.MM.yyyy"
                                  )}
                                </span>
                              </div>
                            )}
                        </div>

                        <div className="mt-4 space-y-2">
                          {planFeatures.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-muted-foreground" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing & Payment Section */}
                  {companySection === "billing" && (
                    <div>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Billing Information */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">
                              Billing information
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Displayed on your invoices.
                          </p>

                          <div className="border border-border rounded-lg p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                  First Name
                                </p>
                                <p className="font-medium">
                                  {company.billingAndPayment.billingFirstName ||
                                    "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                  Last Name
                                </p>
                                <p className="font-medium">
                                  {company.billingAndPayment.billingLastName ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                Company Name
                              </p>
                              <p className="font-medium">
                                {company.billingAndPayment.billingCompanyName ||
                                  company.companyDetails.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Billing Address */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">Billing address</h3>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <Checkbox id="same-address" checked disabled />
                            <label
                              htmlFor="same-address"
                              className="text-sm text-muted-foreground"
                            >
                              Same as company address
                            </label>
                          </div>

                          <div className="border border-border rounded-lg p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                  City
                                </p>
                                <p className="font-medium">
                                  {company.billingAndPayment.billingCity ||
                                    company.companyDetails.city}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                  Zip
                                </p>
                                <p className="font-medium">
                                  {company.billingAndPayment.billingZip ||
                                    company.companyDetails.zip}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                Address
                              </p>
                              <p className="font-medium">
                                {company.billingAndPayment.billingAddress ||
                                  company.companyDetails.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoices Section */}
                  {companySection === "invoices" && (
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Invoices</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        History of your payments and invoices.
                      </p>

                      <div className="border border-border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice date</TableHead>
                              <TableHead>Invoice No.</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {company.invoices.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No invoices found
                                </TableCell>
                              </TableRow>
                            ) : (
                                
                              company.invoices.map((invoice, index) => (
                                <TableRow key={invoice.paymentId}>
                                  <TableCell>
                                    {format(
                                      new Date(invoice.paidAt),
                                      "dd.MM.yyyy"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(invoice.paidAt).getFullYear()}-
                                    {company._id.slice(-8)}-{index + 1}
                                  </TableCell>
                                  <TableCell>
                                    {invoice.amount
                                      .toFixed(2)
                                      .replace(".", ",")}{" "}
                                    €
                                  </TableCell>
                                  <TableCell>
                                    {getPaymentStatusBadge(invoice.status)}
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="outline" size="sm">
                                      Download
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
