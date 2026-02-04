'use client';

import { Navbar } from '@/components/shared/Navbar';
import { MockMRIViewer } from '@/components/viewers/MockMRIViewer';
import { RealMRIViewer } from '@/components/viewers/RealMRIViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/hooks/useApi';
import { ArrowLeft, Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function PatientViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isLoading, error } = useSession(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your scan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-foreground text-lg mb-2">Scan not found</p>
            <p className="text-muted-foreground mb-4">{error || 'Unable to load scan data'}</p>
            <Button variant="outline" asChild>
              <Link href="/patient/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const prediction = session.prediction;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
              <h1 className="text-3xl font-bold text-foreground">My Brain Scan</h1>
              <p className="text-muted-foreground">
                Session: {session.session_code} | Date: {new Date(session.scan_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          {prediction?.patient_pdf_url && (
            <Button variant="outline" asChild>
              <a href={prediction.patient_pdf_url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                Download My Report
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>

        {/* Viewer - Use real viewer if slice URLs available */}
        {prediction?.slice_urls &&
         (prediction.slice_urls.axial?.length > 0 ||
          prediction.slice_urls.sagittal?.length > 0 ||
          prediction.slice_urls.coronal?.length > 0) ? (
          <RealMRIViewer
            sessionId={session.session_code}
            sliceUrls={prediction.slice_urls}
            viewerMode="patient"
            prediction={prediction?.prediction}
            confidence={prediction?.confidence_score}
            showAnnotations={true}
          />
        ) : (
          <MockMRIViewer
            sessionId={session.session_code}
            viewerMode="patient"
            prediction={prediction?.prediction}
            confidence={prediction?.confidence_score}
            showAnnotations={true}
          />
        )}

        {/* Report Download */}
        {prediction?.patient_pdf_url && (
          <Card>
            <CardHeader>
              <CardTitle>Your Report</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={prediction.patient_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors w-fit"
              >
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Patient Report (PDF)</p>
                  <p className="text-sm text-muted-foreground">
                    A simplified explanation of your scan results
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 ml-4" />
              </a>
              {prediction.report_generated_at && (
                <p className="text-xs text-muted-foreground mt-3">
                  Generated: {new Date(prediction.report_generated_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

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
                important for the analysis.
              </p>
            </div>

            {prediction?.prediction === 'AD' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Your Results</h3>
                <p className="text-sm text-red-800 dark:text-red-300">
                  The scan shows patterns that may be consistent with Alzheimer's Disease. The
                  highlighted regions (hippocampus and temporal lobes) show some changes that
                  are being flagged for your doctor's attention.
                </p>
                <p className="text-sm text-red-800 dark:text-red-300 mt-2 font-medium">
                  Please discuss these findings with your doctor, who will explain what they mean
                  for you and recommend next steps.
                </p>
              </div>
            )}

            {prediction?.prediction === 'MCI' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Your Results</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  The scan shows some early changes that may indicate Mild Cognitive Impairment (MCI).
                  MCI is a condition where there are subtle changes in memory or thinking that are
                  greater than expected for your age, but don't significantly interfere with daily life.
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
                  Many people with MCI remain stable or even improve over time. Lifestyle factors
                  like exercise, diet, and mental activity can help.
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2 font-medium">
                  Please discuss these findings with your doctor for personalized recommendations.
                </p>
              </div>
            )}

            {prediction?.prediction === 'CN' && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">Your Results</h3>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Great news! Your scan shows normal brain patterns with no signs of neurodegenerative
                  disease. Your brain appears healthy for your age.
                </p>
                <p className="text-sm text-green-800 dark:text-green-300 mt-2">
                  Continue to maintain a healthy lifestyle and follow up with your doctor as
                  recommended for routine care.
                </p>
              </div>
            )}

            {!prediction?.prediction && session.status === 'processing' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Analysis in Progress</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Your scan is currently being analyzed by our AI system. Results will be available
                  soon. Please check back later or refresh the page.
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

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Important:</strong> This AI analysis is meant to assist your healthcare provider
                and should not be used as the sole basis for diagnosis or treatment decisions. Always
                consult with your doctor about your results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
