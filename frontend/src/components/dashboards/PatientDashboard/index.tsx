'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { PredictionCard } from '@/components/shared/PredictionCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockMRISessions, mockPatientStats, mockPatients } from '@/lib/mockData';
import { Download, Eye, Calendar, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const PatientDashboard: React.FC = () => {
  const patient = mockPatients[0]; // John Doe
  const patientSessions = mockMRISessions.filter(s => s.patientId === 'patient-1');
  const latestSession = patientSessions[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {patient.name}</h1>
        <p className="text-muted-foreground mt-1">
          Patient ID: {patient.patientCode} | Assigned Doctor: {patient.assignedDoctor}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Scans"
          value={mockPatientStats.totalScans}
          icon={Activity}
          description="All-time scans"
        />
        <StatsCard
          title="Recent Activity"
          value={mockPatientStats.lastWeekScans}
          icon={TrendingUp}
          description="Scans in last 7 days"
          trend={{ value: 50, isPositive: true }}
        />
        <StatsCard
          title="Last Scan Date"
          value={patient.lastScan || 'N/A'}
          icon={Calendar}
          description="Most recent scan"
        />
      </div>

      {/* Latest Result */}
      {latestSession && latestSession.probabilities && (
        <div className="grid gap-6 md:grid-cols-2">
          <PredictionCard
            prediction={latestSession.prediction!}
            probabilities={latestSession.probabilities}
            confidenceScore={latestSession.probabilities[latestSession.prediction!]}
          />

          <Card>
            <CardHeader>
              <CardTitle>Volumetric Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestSession.volumetrics && (
                <>
                  <div>
                    <p className="text-sm font-medium">Hippocampus Volume</p>
                    <p className="text-sm text-muted-foreground">
                      {latestSession.volumetrics.hippocampus}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ventricular Size</p>
                    <p className="text-sm text-muted-foreground">
                      {latestSession.volumetrics.ventricles}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cortical Thickness</p>
                    <p className="text-sm text-muted-foreground">
                      {latestSession.volumetrics.corticalThickness}
                    </p>
                  </div>
                </>
              )}
              <div className="pt-4">
                <Button className="w-full" asChild>
                  <Link href={`/patient/viewer/${latestSession.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Scan Images
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle>My Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.sessionCode}</TableCell>
                  <TableCell>{session.scanDate}</TableCell>
                  <TableCell>{session.doctorName}</TableCell>
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
                    <div className="flex gap-2">
                      {session.status === 'completed' && (
                        <>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/patient/viewer/${session.id}`}>
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

      {/* Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">{patient.assignedDoctor}</h3>
              <p className="text-sm text-muted-foreground">Neurology Specialist</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your doctor will review your scan results and discuss the findings with you.
              </p>
            </div>
            <Button>Schedule Appointment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
