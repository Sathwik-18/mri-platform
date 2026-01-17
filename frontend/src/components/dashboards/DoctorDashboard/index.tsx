'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPatients, mockMRISessions, mockDoctorStats } from '@/lib/mockData';
import {
  Users,
  ClipboardList,
  Activity,
  TrendingUp,
  Eye,
  Download,
  Search,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const DoctorDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const resultDistribution = [
    { name: 'CN', value: mockDoctorStats.resultDistribution.CN, color: '#10b981' },
    { name: 'AD', value: mockDoctorStats.resultDistribution.AD, color: '#ef4444' },
    { name: 'PD', value: mockDoctorStats.resultDistribution.PD, color: '#f59e0b' },
    { name: 'FTD', value: mockDoctorStats.resultDistribution.FTD, color: '#8b5cf6' },
  ];

  const monthlyTrend = [
    { month: 'Jul', scans: 5 },
    { month: 'Aug', scans: 7 },
    { month: 'Sep', scans: 6 },
    { month: 'Oct', scans: 8 },
    { month: 'Nov', scans: 9 },
    { month: 'Dec', scans: 8 },
  ];

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingReviews = mockMRISessions.filter(s => s.status === 'completed').slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, Dr. Sarah Mitchell | Neurology Department
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={mockDoctorStats.totalPatients}
          icon={Users}
          description="Assigned to you"
        />
        <StatsCard
          title="Pending Reviews"
          value={mockDoctorStats.pendingReviews}
          icon={ClipboardList}
          description="Requiring attention"
          trend={{ value: 20, isPositive: false }}
        />
        <StatsCard
          title="Completed Scans"
          value={mockDoctorStats.completedScans}
          icon={Activity}
          description="All-time"
        />
        <StatsCard
          title="This Month"
          value={mockDoctorStats.thisMonthScans}
          icon={TrendingUp}
          description="Scans reviewed"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={resultDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resultDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {resultDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Scan Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#0066CC" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">My Patients</TabsTrigger>
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="recent">Recent Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient List</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Total Scans</TableHead>
                    <TableHead>Last Scan</TableHead>
                    <TableHead>Latest Result</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.patientCode}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.totalScans}</TableCell>
                      <TableCell>{patient.lastScan || 'N/A'}</TableCell>
                      <TableCell>
                        {patient.latestPrediction ? (
                          <Badge
                            variant={
                              patient.latestPrediction === 'CN' ? 'default' : 'destructive'
                            }
                          >
                            {patient.latestPrediction}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/doctor/patient/${patient.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scans Requiring Review</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Code</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReviews.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.sessionCode}</TableCell>
                      <TableCell>{session.patientName}</TableCell>
                      <TableCell>{session.scanDate}</TableCell>
                      <TableCell>
                        {session.prediction && (
                          <Badge
                            variant={
                              session.prediction === 'CN' ? 'default' : 'destructive'
                            }
                          >
                            {session.prediction}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.probabilities &&
                          `${(session.probabilities[session.prediction!] * 100).toFixed(1)}%`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/doctor/viewer/${session.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent MRI Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Code</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Radiologist</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Scanner</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMRISessions.slice(0, 5).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.sessionCode}</TableCell>
                      <TableCell>{session.patientName}</TableCell>
                      <TableCell className="text-sm">{session.radiologistName || 'N/A'}</TableCell>
                      <TableCell>{session.scanDate}</TableCell>
                      <TableCell className="text-sm">
                        {session.scannerInfo?.manufacturer || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {session.prediction ? (
                          <Badge
                            variant={
                              session.prediction === 'CN' ? 'default' : 'destructive'
                            }
                          >
                            {session.prediction}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{session.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.status === 'completed' && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/doctor/viewer/${session.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
