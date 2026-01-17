'use client';

import { Navbar } from '@/components/shared/Navbar';
import { MockMRIViewer } from '@/components/viewers/MockMRIViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMRISessions } from '@/lib/mockData';
import { Download, ArrowLeft, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function RadiologistViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const session = mockMRISessions.find((s) => s.id === id) || mockMRISessions[0];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar userName="Dr. David Chen" userRole="radiologist" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/radiologist/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Advanced MRI Workstation</h1>
              <p className="text-gray-400">
                Session: {session.sessionCode} | Patient: {session.patientName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Technical Report
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export DICOM
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download All Reports
            </Button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Series/Sequence Browser */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Series Browser</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 bg-primary/20 border border-primary rounded-lg cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">T1 MPRAGE</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-xs text-gray-400">192 images | 1.0mm</p>
              </div>
              <div className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">T2 FLAIR</span>
                </div>
                <p className="text-xs text-gray-400">128 images | 1.5mm</p>
              </div>
              <div className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">DWI</span>
                </div>
                <p className="text-xs text-gray-400">64 images | 2.0mm</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Viewer Area */}
          <div className="xl:col-span-2 space-y-6">
            <Tabs defaultValue="mpr" className="space-y-4">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="mpr">Multi-Planar</TabsTrigger>
                <TabsTrigger value="3d">3D Rendering</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
              </TabsList>

              <TabsContent value="mpr" className="space-y-4">
                <MockMRIViewer
                  sessionId={session.sessionCode}
                  viewerMode="radiologist"
                  prediction={session.prediction || undefined}
                  showAnnotations={true}
                />
              </TabsContent>

              <TabsContent value="3d" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="bg-black rounded-lg flex items-center justify-center h-[600px]">
                      <div className="text-center">
                        <Eye className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">3D Volume Rendering</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Interactive 3D brain reconstruction would appear here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compare" className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black rounded-lg flex items-center justify-center h-64">
                        <p className="text-gray-400">Current Scan</p>
                      </div>
                      <div className="bg-black rounded-lg flex items-center justify-center h-64">
                        <p className="text-gray-400">Previous Scan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Analysis & Measurements */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Prediction */}
              {session.prediction && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">AI Prediction</h4>
                  <Badge
                    className={`${
                      session.prediction === 'CN'
                        ? 'bg-green-500'
                        : session.prediction === 'AD'
                        ? 'bg-red-500'
                        : session.prediction === 'PD'
                        ? 'bg-orange-500'
                        : 'bg-purple-500'
                    }`}
                  >
                    {session.prediction}
                  </Badge>
                  {session.probabilities && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(session.probabilities).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-white font-medium">
                            {(value * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Measurements */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Measurements</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Brain Volume:</span>
                    <span className="text-white">1245 cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">GM Volume:</span>
                    <span className="text-white">678 cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">WM Volume:</span>
                    <span className="text-white">456 cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CSF Volume:</span>
                    <span className="text-white">111 cm³</span>
                  </div>
                </div>
              </div>

              {/* Quality Control */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Quality Control</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SNR:</span>
                    <span className="text-green-400">Good (42.5)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Motion Artifacts:</span>
                    <span className="text-green-400">Minimal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coverage:</span>
                    <span className="text-green-400">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overall Quality:</span>
                    <Badge variant="default" className="bg-green-600">
                      Excellent
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="p-3 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Scan Parameters</h4>
                {session.scannerInfo && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scanner:</span>
                      <span className="text-white">{session.scannerInfo.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-white">{session.scannerInfo.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Field:</span>
                      <span className="text-white">{session.scannerInfo.fieldStrength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sequence:</span>
                      <span className="text-white">{session.scannerInfo.sequenceType}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <Button className="w-full" size="sm" variant="outline">
                  Generate Report
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  Mark as Reviewed
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  Send to Referring Doctor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
