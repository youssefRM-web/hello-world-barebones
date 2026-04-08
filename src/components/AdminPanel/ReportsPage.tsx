import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const barChartData = [
  { day: 'Mon', newTickets: 14, resolved: 8 },
  { day: 'Tue', newTickets: 18, resolved: 12 },
  { day: 'Wed', newTickets: 22, resolved: 10 },
  { day: 'Thu', newTickets: 25, resolved: 20 },
  { day: 'Fri', newTickets: 20, resolved: 18 },
  { day: 'Sat', newTickets: 10, resolved: 8 },
  { day: 'Sun', newTickets: 8, resolved: 5 },
];

const areaChartData = [
  { day: 'Mon', time: 45 },
  { day: 'Tue', time: 52 },
  { day: 'Wed', time: 58 },
  { day: 'Thu', time: 65 },
  { day: 'Fri', time: 55 },
  { day: 'Sat', time: 40 },
  { day: 'Sun', time: 35 },
];

const stats = [
  {
    label: 'Total Tickets',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    icon: <div className="w-5 h-5 text-muted-foreground">📋</div>,
  },
  {
    label: 'Avg. Response Time',
    value: '42m',
    change: '-8%',
    trend: 'down',
    icon: <Clock className="w-5 h-5 text-muted-foreground" />,
  },
  {
    label: 'Resolution Rate',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    label: 'Active Customers',
    value: '843',
    change: '+5%',
    trend: 'up',
    icon: <Users className="w-5 h-5 text-orange-500" />,
  },
];

export function ReportsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Analytics Overview</h1>
          <p className="text-muted-foreground">Track support team performance and ticket volume.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Jan 20, 2025 - Feb 09, 2025
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {stat.icon}
                <div className={`flex items-center gap-1 text-xs ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1">Ticket Volume vs Resolution</h3>
            <p className="text-sm text-muted-foreground mb-6">Daily comparison of new tickets vs resolved</p>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="newTickets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Area Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1">Average Response Time</h3>
            <p className="text-sm text-muted-foreground mb-6">Minutes to first reply (last 7 days)</p>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}m`} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorTime)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
