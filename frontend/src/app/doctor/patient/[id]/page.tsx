'use client';

import { Navbar } from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { mockPatients, mockMRISessions } from '@/lib/mockData';
import { ArrowLeft, Eye, Download, Calendar, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function DoctorPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0];
  const patientSessions = mockMRISessions.filter((s) => s.patientId === id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/doctor/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{patient.name}</h1>
              <p className="text-muted-foreground">Patient ID: {patient.patientCode}</p>
            </div>
          </div>
          <Button>Schedule Appointment</Button>
        </div>

        {/* Patient Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Age / Gender</p>
                  <p className="text-lg font-semibold">{patient.age}y / {patient.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="text-lg font-semibold">{patient.bloodGroup}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-lg font-semibold">{patient.totalScans}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Scan</p>
                  <p className="text-lg font-semibold">{patient.lastScan || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* MRI History */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MRI Scan History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session Code</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.scanDate}</TableCell>
                        <TableCell className="font-medium">{session.sessionCode}</TableCell>
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
                          {session.probabilities &&
                            session.prediction &&
                            `${(session.probabilities[session.prediction] * 100).toFixed(1)}%`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              session.status === 'completed' ? 'default' : 'secondary'
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
                                  <Link href={`/doctor/viewer/${session.id}`}>
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

            {/* Progression Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Disease Progression Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Timeline chart would appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.latestPrediction ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Diagnosis</p>
                      <Badge
                        className="text-base"
                        variant={
                          patient.latestPrediction === 'CN' ? 'default' : 'destructive'
                        }
                      >
                        {patient.latestPrediction}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Assessment Date</p>
                      <p className="font-medium">{patient.lastScan}</p>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/doctor/viewer/${patientSessions[0]?.id}`}>
                        Review Full Report
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No assessments yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Request New Scan
                </Button>
                <Button variant="outline" className="w-full">
                  View Medical History
                </Button>
                <Button variant="outline" className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
