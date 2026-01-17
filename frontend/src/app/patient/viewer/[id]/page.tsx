'use client';

import { Navbar } from '@/components/shared/Navbar';
import { MockMRIViewer } from '@/components/viewers/MockMRIViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockMRISessions } from '@/lib/mockData';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function PatientViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const session = mockMRISessions.find((s) => s.id === id) || mockMRISessions[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar userName="John Doe" userRole="patient" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/patient/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Brain Scan</h1>
              <p className="text-muted-foreground">
                Session: {session.sessionCode} | Date: {session.scanDate}
              </p>
            </div>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Viewer */}
        <MockMRIViewer
          sessionId={session.sessionCode}
          viewerMode="patient"
          prediction={session.prediction || undefined}
          showAnnotations={true}
        />

        {/* Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Understanding Your Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What You're Looking At</h3>
              <p className="text-sm text-muted-foreground">
                This is a cross-sectional view of your brain, similar to looking at a slice of an
                orange. You can scroll through different slices to see your entire brain. The
                highlighted areas (if any) show regions that our AI system identified as
                important for the diagnosis.
              </p>
            </div>

            {session.prediction && session.prediction !== 'CN' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Your Results</h3>
                <p className="text-sm text-yellow-800">
                  {session.prediction === 'AD' &&
                    'The scan shows patterns consistent with Alzheimer\'s Disease. The highlighted regions (hippocampus) show some volume reduction, which is typical in AD.'}
                  {session.prediction === 'PD' &&
                    'The scan shows patterns consistent with Parkinson\'s Disease. The highlighted region (substantia nigra) shows changes typical in PD.'}
                  {session.prediction === 'FTD' &&
                    'The scan shows patterns consistent with Frontotemporal Dementia. The highlighted frontal lobe regions show changes typical in FTD.'}
                </p>
                <p className="text-sm text-yellow-800 mt-2 font-medium">
                  Please discuss these findings with your doctor, who will explain what they mean
                  for you and recommend next steps.
                </p>
              </div>
            )}

            {session.prediction === 'CN' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Your Results</h3>
                <p className="text-sm text-green-800">
                  Your scan shows normal brain patterns with no signs of neurodegenerative disease.
                  Continue to maintain a healthy lifestyle and follow up with your doctor as
                  recommended.
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">How to Use the Viewer</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use the slider below the image to scroll through different brain slices</li>
                <li>Click the play button to see an animated view of all slices</li>
                <li>Higher slice numbers show the top of your brain, lower numbers show the bottom</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
