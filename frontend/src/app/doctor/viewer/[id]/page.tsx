'use client';

import { Navbar } from '@/components/shared/Navbar';
import { MockMRIViewer } from '@/components/viewers/MockMRIViewer';
import { RealMRIViewer } from '@/components/viewers/RealMRIViewer';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/lib/hooks/useApi';
import { ArrowLeft, Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function DoctorViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isLoading, error } = useSession(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading session data...</p>
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
            <p className="text-foreground text-lg mb-2">Session not found</p>
            <p className="text-muted-foreground mb-4">{error || 'Unable to load session data'}</p>
            <Button variant="outline" asChild>
              <Link href="/doctor/dashboard">
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
  const patientName = session.patient?.user_profile?.full_name || 'Unknown Patient';
  const radiologistName = session.radiologist?.user_profile?.full_name || 'N/A';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
              <h1 className="text-3xl font-bold text-foreground">Clinical MRI Review</h1>
              <p className="text-muted-foreground">
                Patient: {patientName} | Session: {session.session_code}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {prediction?.clinician_pdf_url && (
              <Button variant="outline" asChild>
                <a href={prediction.clinician_pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  Clinician Report
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* MRI Viewer - Use real viewer if slice URLs available */}
            {prediction?.slice_urls &&
             (prediction.slice_urls.axial?.length > 0 ||
              prediction.slice_urls.sagittal?.length > 0 ||
              prediction.slice_urls.coronal?.length > 0) ? (
              <RealMRIViewer
                sessionId={session.session_code}
                sliceUrls={prediction.slice_urls}
                viewerMode="doctor"
                prediction={prediction?.prediction}
                confidence={prediction?.confidence_score}
                showAnnotations={true}
              />
            ) : (
              <MockMRIViewer
                sessionId={session.session_code}
                viewerMode="doctor"
                prediction={prediction?.prediction}
                confidence={prediction?.confidence_score}
                showAnnotations={true}
              />
            )}

            {/* Reports Section */}
            {prediction && (prediction.clinician_pdf_url || prediction.patient_pdf_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap">
                    {prediction.clinician_pdf_url && (
                      <a
                        href={prediction.clinician_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Clinician Report (PDF)</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {prediction.patient_pdf_url && (
                      <a
                        href={prediction.patient_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Patient Report (PDF)</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {prediction.report_generated_at && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Reports generated: {new Date(prediction.report_generated_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Prediction */}
            {prediction?.probabilities && prediction?.prediction && (
              <PredictionCard
                prediction={prediction.prediction}
                probabilities={prediction.probabilities}
                confidenceScore={prediction.confidence_score || 0}
              />
            )}

            {/* Clinical Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prediction?.prediction ? (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {prediction.prediction === 'AD' && (
                      <>
                        <p>- Comprehensive cognitive assessment recommended</p>
                        <p>- Consider pharmacological intervention (cholinesterase inhibitors)</p>
                        <p>- Follow-up MRI in 6 months to monitor progression</p>
                        <p>- Refer to memory clinic for specialized care</p>
                        <p>- Discuss care planning with family</p>
                      </>
                    )}
                    {prediction.prediction === 'MCI' && (
                      <>
                        <p>- Cognitive screening and monitoring recommended</p>
                        <p>- Lifestyle modifications (exercise, diet, cognitive activities)</p>
                        <p>- Monitor for progression to dementia</p>
                        <p>- Follow-up MRI in 12 months</p>
                        <p>- Consider neuropsychological testing</p>
                      </>
                    )}
                    {prediction.prediction === 'CN' && (
                      <>
                        <p>- Routine follow-up as scheduled</p>
                        <p>- Maintain healthy lifestyle habits</p>
                        <p>- No immediate intervention required</p>
                        <p>- Continue age-appropriate health screenings</p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {session.status === 'processing'
                      ? 'Recommendations will be available after analysis completes.'
                      : 'No analysis results available.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Session Information */}
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Code:</span>
                  <span>{session.patient?.patient_code || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scan Date:</span>
                  <span>{new Date(session.scan_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Radiologist:</span>
                  <span>{radiologistName}</span>
                </div>
                {session.scanner_manufacturer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scanner:</span>
                    <span>{session.scanner_manufacturer}</span>
                  </div>
                )}
                {session.sequence_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sequence:</span>
                    <span>{session.sequence_type}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {session.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
