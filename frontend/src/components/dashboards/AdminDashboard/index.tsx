'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockUsers, mockPatients, mockDoctors, mockAdminStats } from '@/lib/mockData';
import {
  Users,
  UserPlus,
  Activity,
  Shield,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const roleStats = [
    {
      label: 'Patients',
      value: mockAdminStats.totalPatients,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Doctors',
      value: mockAdminStats.totalDoctors,
      icon: Shield,
      change: '+2',
      changeType: 'positive' as const,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Radiologists',
      value: mockAdminStats.totalRadiologists,
      icon: Activity,
      change: '0',
      changeType: 'neutral' as const,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Admins',
      value: mockAdminStats.totalAdmins,
      icon: Shield,
      change: '+1',
      changeType: 'positive' as const,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, permissions, and hospital operations
          </p>
        </div>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Select their role and provide necessary information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="radiologist">Radiologist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateUserOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsCreateUserOpen(false)}>
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={mockAdminStats.totalUsers}
          icon={Users}
          description="All roles combined"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Actions"
          value={mockAdminStats.pendingVerifications}
          icon={AlertCircle}
          description="Require attention"
          className="border-orange-200 dark:border-orange-900"
        />
        <StatsCard
          title="Monthly Scans"
          value={mockAdminStats.scansThisMonth}
          icon={Activity}
          description="Hospital-wide"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Doctors"
          value={mockAdminStats.totalDoctors}
          icon={Shield}
          description="Verified & active"
        />
      </div>

      {/* Role Distribution Cards */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleStats.map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-lg border p-6 transition-all hover:shadow-md ${stat.bgColor}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className={`text-xs mt-2 ${
                        stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
                        stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stat.changeType === 'positive' && '↑ '}
                        {stat.change} this month
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="verify">
            Verifications
            <Badge variant="destructive" className="ml-2">
              {mockAdminStats.pendingVerifications}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="assign">Assignments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search users..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="radiologist">Radiologist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-emerald-500">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            Suspend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mockPatients.slice(0, 3).map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {patient.patientCode}@hospital.com
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          patient
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-emerald-500">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            Suspend
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

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Pending Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDoctors.map((doctor) => (
                  <Card key={doctor.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{doctor.name}</h3>
                            <Badge variant="outline">{doctor.specialization}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>License: <span className="font-mono">{doctor.license}</span></p>
                            <p>Patients: {doctor.patientsCount} | Scans: {doctor.scansThisMonth} this month</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Patients to Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="selectDoctor">Select Doctor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              {doctor.name} - {doctor.specialization}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="selectPatient">Select Patient</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.patientCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Patient to Doctor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{mockAdminStats.scansThisMonth}</div>
                  <p className="text-sm text-muted-foreground">Scans this month</p>
                  <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12% from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{mockAdminStats.totalUsers}</div>
                  <p className="text-sm text-muted-foreground">Registered users</p>
                  <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8% growth</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pending Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {mockAdminStats.pendingVerifications}
                  </div>
                  <p className="text-sm text-muted-foreground">Require attention</p>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Review Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export comprehensive reports for analysis and compliance
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Usage Report
                </Button>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  User Statistics
                </Button>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
