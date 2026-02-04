'use client';

import { Navbar } from '@/components/shared/Navbar';
import { MockMRIViewer } from '@/components/viewers/MockMRIViewer';
import { RealMRIViewer } from '@/components/viewers/RealMRIViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/lib/hooks/useApi';
import { Download, ArrowLeft, FileText, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function RadiologistViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isLoading, error } = useSession(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-400">Loading session data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Session not found</p>
            <p className="text-gray-400 mb-4">{error || 'Unable to load session data'}</p>
            <Button variant="outline" asChild>
              <Link href="/radiologist/dashboard">
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

  // Helper to get prediction color
  const getPredictionColor = (pred: string | undefined) => {
    switch (pred) {
      case 'CN': return 'bg-green-500';
      case 'MCI': return 'bg-yellow-500';
      case 'AD': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper to get prediction label
  const getPredictionLabel = (pred: string | undefined) => {
    switch (pred) {
      case 'CN': return 'Cognitively Normal';
      case 'MCI': return 'Mild Cognitive Impairment';
      case 'AD': return "Alzheimer's Disease";
      default: return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
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
              <h1 className="text-3xl font-bold text-white">MRI Viewer</h1>
              <p className="text-gray-400">
                Session: {session.session_code} | Patient: {patientName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {prediction?.technical_pdf_url && (
              <Button variant="outline" asChild>
                <a href={prediction.technical_pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  Technical Report
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
            {prediction?.clinician_pdf_url && (
              <Button variant="outline" asChild>
                <a href={prediction.clinician_pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Clinician Report
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Session Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Session Code:</span>
                  <span className="text-white font-medium">{session.session_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scan Date:</span>
                  <span className="text-white">
                    {new Date(session.scan_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Analysis Type:</span>
                  <span className="text-white">{session.analysis_type || 'Multi-disease'}</span>
                </div>
              </div>

              {/* Scanner Info */}
              {session.scanner_manufacturer && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-2">Scanner Info</h4>
                  <div className="space-y-1 text-xs">
                    {session.scanner_manufacturer && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Manufacturer:</span>
                        <span className="text-white">{session.scanner_manufacturer}</span>
                      </div>
                    )}
                    {session.scanner_model && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white">{session.scanner_model}</span>
                      </div>
                    )}
                    {session.scanner_field_strength && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Field Strength:</span>
                        <span className="text-white">{session.scanner_field_strength}</span>
                      </div>
                    )}
                    {session.sequence_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sequence:</span>
                        <span className="text-white">{session.sequence_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Viewer Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Use RealMRIViewer if slice URLs are available, otherwise MockMRIViewer */}
            {prediction?.slice_urls &&
             (prediction.slice_urls.axial?.length > 0 ||
              prediction.slice_urls.sagittal?.length > 0 ||
              prediction.slice_urls.coronal?.length > 0) ? (
              <RealMRIViewer
                sessionId={session.session_code}
                sliceUrls={prediction.slice_urls}
                viewerMode="radiologist"
                prediction={prediction?.prediction}
                confidence={prediction?.confidence_score}
                showAnnotations={true}
              />
            ) : (
              <MockMRIViewer
                sessionId={session.session_code}
                viewerMode="radiologist"
                prediction={prediction?.prediction}
                confidence={prediction?.confidence_score}
                showAnnotations={true}
              />
            )}
          </div>

          {/* Right Sidebar - Analysis Results */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Prediction */}
              {prediction ? (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">AI Prediction</h4>
                  <Badge className={getPredictionColor(prediction.prediction)}>
                    {getPredictionLabel(prediction.prediction)}
                  </Badge>

                  {/* Confidence */}
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white font-medium">
                      {((prediction.confidence_score || 0) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Probabilities */}
                  {prediction.probabilities && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-400 mb-1">Probability Distribution:</p>
                      {Object.entries(prediction.probabilities).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-white font-medium">
                            {((value || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">AI Prediction</h4>
                  <p className="text-gray-400 text-sm">
                    {session.status === 'processing'
                      ? 'Analysis in progress...'
                      : 'No prediction available'}
                  </p>
                </div>
              )}

              {/* Model Info */}
              {prediction?.model_version && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Model Info</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Version:</span>
                      <span className="text-white">{prediction.model_version}</span>
                    </div>
                    {prediction.processing_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing Time:</span>
                        <span className="text-white">{prediction.processing_time}ms</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visualizations */}
              {prediction && (prediction.similarity_plot_url || prediction.volume_chart_url || prediction.confidence_chart_url) && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Visualizations</h4>
                  <div className="space-y-2">
                    {prediction.similarity_plot_url && (
                      <a
                        href={prediction.similarity_plot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Similarity Plot
                      </a>
                    )}
                    {prediction.volume_chart_url && (
                      <a
                        href={prediction.volume_chart_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Volume Chart
                      </a>
                    )}
                    {prediction.confidence_chart_url && (
                      <a
                        href={prediction.confidence_chart_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Confidence Chart
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Reports */}
              {prediction && (prediction.technical_pdf_url || prediction.clinician_pdf_url || prediction.patient_pdf_url) && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Reports</h4>
                  <div className="space-y-2">
                    {prediction.technical_pdf_url && (
                      <a
                        href={prediction.technical_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-400 hover:underline"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Technical Report (PDF)
                      </a>
                    )}
                    {prediction.clinician_pdf_url && (
                      <a
                        href={prediction.clinician_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-400 hover:underline"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Clinician Report (PDF)
                      </a>
                    )}
                    {prediction.patient_pdf_url && (
                      <a
                        href={prediction.patient_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-400 hover:underline"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Patient Report (PDF)
                      </a>
                    )}
                  </div>
                  {prediction.report_generated_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Generated: {new Date(prediction.report_generated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {session.notes && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">Notes</h4>
                  <p className="text-xs text-gray-300">{session.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
