'use client';

import { Navbar } from '@/components/shared/Navbar';
import { MockMRIViewer } from '@/components/viewers/MockMRIViewer';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMRISessions } from '@/lib/mockData';
import { Download, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function DoctorViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const session = mockMRISessions.find((s) => s.id === id) || mockMRISessions[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar userName="Dr. Sarah Mitchell" userRole="doctor" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/doctor/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Clinical MRI Review</h1>
              <p className="text-muted-foreground">
                Patient: {session.patientName} | Session: {session.sessionCode}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Patient Report
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Clinician Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Viewer Tabs */}
            <Tabs defaultValue="axial" className="space-y-4">
              <TabsList>
                <TabsTrigger value="axial">Axial View</TabsTrigger>
                <TabsTrigger value="sagittal">Sagittal View</TabsTrigger>
                <TabsTrigger value="coronal">Coronal View</TabsTrigger>
              </TabsList>

              <TabsContent value="axial" className="space-y-4">
                <MockMRIViewer
                  sessionId={session.sessionCode}
                  viewerMode="doctor"
                  prediction={session.prediction || undefined}
                  showAnnotations={true}
                />
              </TabsContent>

              <TabsContent value="sagittal" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-gray-900 rounded-lg flex items-center justify-center h-96">
                      <p className="text-gray-400">Sagittal View</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coronal" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-gray-900 rounded-lg flex items-center justify-center h-96">
                      <p className="text-gray-400">Coronal View</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Prediction */}
            {session.probabilities && session.prediction && (
              <PredictionCard
                prediction={session.prediction}
                probabilities={session.probabilities}
                confidenceScore={session.probabilities[session.prediction]}
              />
            )}

            {/* Clinical Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.volumetrics && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Volumetric Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Hippocampus:</span>
                        <p className="font-medium">{session.volumetrics.hippocampus}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ventricles:</span>
                        <p className="font-medium">{session.volumetrics.ventricles}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cortical Thickness:</span>
                        <p className="font-medium">{session.volumetrics.corticalThickness}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {session.prediction === 'AD' && (
                      <>
                        <p>• Cognitive assessment recommended</p>
                        <p>• Consider pharmacological intervention</p>
                        <p>• Follow-up MRI in 6 months</p>
                        <p>• Refer to memory clinic</p>
                      </>
                    )}
                    {session.prediction === 'PD' && (
                      <>
                        <p>• Neurological examination recommended</p>
                        <p>• Consider DaTscan for confirmation</p>
                        <p>• Evaluate motor symptoms</p>
                        <p>• Refer to movement disorder specialist</p>
                      </>
                    )}
                    {session.prediction === 'FTD' && (
                      <>
                        <p>• Behavioral assessment recommended</p>
                        <p>• Genetic counseling if early onset</p>
                        <p>• Speech and language evaluation</p>
                        <p>• Follow-up MRI in 6 months</p>
                      </>
                    )}
                    {session.prediction === 'CN' && (
                      <>
                        <p>• Routine follow-up as scheduled</p>
                        <p>• Maintain healthy lifestyle</p>
                        <p>• No immediate intervention required</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{session.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scan Date:</span>
                  <span>{session.scanDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Radiologist:</span>
                  <span>{session.radiologistName || 'N/A'}</span>
                </div>
                {session.scannerInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scanner:</span>
                      <span>{session.scannerInfo.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sequence:</span>
                      <span>{session.scannerInfo.sequenceType}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
