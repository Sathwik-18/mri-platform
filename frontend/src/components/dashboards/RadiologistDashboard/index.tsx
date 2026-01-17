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
import { mockDoctors, mockMRISessions, mockRadiologistStats } from '@/lib/mockData';
import {
  Upload,
  Activity,
  Clock,
  CheckCircle2,
  Eye,
  Download,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export const RadiologistDashboard: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const sessions = selectedDoctor
    ? mockMRISessions.filter((s) => s.doctorId === selectedDoctor)
    : mockMRISessions;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Radiologist Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, Dr. David Chen | Radiology Department
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value={mockRadiologistStats.totalScans}
          icon={Activity}
          description="All-time processed"
        />
        <StatsCard
          title="Processing Queue"
          value={mockRadiologistStats.processingScans}
          icon={Clock}
          description="Currently processing"
        />
        <StatsCard
          title="Completed Today"
          value={mockRadiologistStats.completedToday}
          icon={CheckCircle2}
          description="Finished today"
          trend={{ value: 25, isPositive: true }}
        />
        <StatsCard
          title="Quality Score"
          value={`${mockRadiologistStats.qualityScore}%`}
          icon={CheckCircle2}
          description="Image quality"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20" asChild>
              <Link href="/radiologist/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload New Scan
              </Link>
            </Button>
            <Button variant="outline" className="h-20">
              <Activity className="mr-2 h-5 w-5" />
              View Processing Queue
            </Button>
            <Button variant="outline" className="h-20">
              <Download className="mr-2 h-5 w-5" />
              Batch Export Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="all-sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-sessions">All Sessions</TabsTrigger>
          <TabsTrigger value="by-doctor">Browse by Doctor</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="all-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All MRI Sessions</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search sessions..." className="w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Code</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Scanner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.sessionCode}</TableCell>
                      <TableCell>{session.patientName}</TableCell>
                      <TableCell className="text-sm">{session.doctorName}</TableCell>
                      <TableCell>{session.scanDate}</TableCell>
                      <TableCell className="text-sm">
                        {session.scannerInfo?.manufacturer || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.status === 'completed'
                              ? 'default'
                              : session.status === 'processing'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {session.status}
                        </Badge>
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
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {session.status === 'completed' && (
                            <>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/radiologist/viewer/${session.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-doctor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Browse by Referring Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialization} | License: {doctor.license}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {doctor.patientsCount} patients
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doctor.scansThisMonth} scans this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedDoctor && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Patients of {mockDoctors.find((d) => d.id === selectedDoctor)?.name}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDoctor(null)}
                    >
                      Clear Filter
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session Code</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {session.sessionCode}
                          </TableCell>
                          <TableCell>{session.patientName}</TableCell>
                          <TableCell>{session.scanDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                session.status === 'completed'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/radiologist/viewer/${session.id}`}>
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMRISessions
                  .filter((s) => s.status === 'processing')
                  .map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{session.sessionCode}</h3>
                            <p className="text-sm text-muted-foreground">
                              {session.patientName} | {session.doctorName}
                            </p>
                          </div>
                          <Badge variant="secondary">Processing...</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-3/4 rounded-full animate-pulse" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Estimated time: 2-3 minutes
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
