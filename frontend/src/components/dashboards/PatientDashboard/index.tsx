'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReportViewer } from '@/components/shared/ReportViewer';
import { usePatientStats, useMySessions, useCurrentPatient } from '@/lib/hooks/useApi';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Eye,
  Calendar,
  Activity,
  Download,
  Brain,
  FileText,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import {
  SpotlightCard,
  AnimatedCounter,
  RevealOnScroll,
  PulseRing,
  FloatingCard,
} from '@/components/ui/animated';

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'purple',
  isLoading = false
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'purple' | 'teal' | 'blue' | 'green';
  isLoading?: boolean;
}) {
  const iconColors = {
    purple: 'text-primary',
    teal: 'text-teal-500',
    blue: 'text-blue-500',
    green: 'text-green-500'
  };

  const bgColors = {
    purple: 'bg-primary/10',
    teal: 'bg-teal-500/10',
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10'
  };

  return (
    <SpotlightCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : typeof value === 'number' ? (
              <span className="text-3xl font-bold text-foreground">
                <AnimatedCounter value={value} />
              </span>
            ) : (
              <span className="text-2xl font-bold text-foreground">{value}</span>
            )}
            {trend && !isLoading && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColors[color]}`}>
          <Icon className={`h-6 w-6 ${iconColors[color]}`} />
        </div>
      </div>
    </SpotlightCard>
  );
}

// ============================================================================
// PREDICTION DISPLAY COMPONENT
// ============================================================================
function PredictionDisplay({
  prediction,
  probabilities,
  confidence
}: {
  prediction: string;
  probabilities: Record<string, number>;
  confidence: number;
}) {
  const predictionInfo: Record<string, { label: string; description: string; color: string }> = {
    'CN': { label: 'Cognitively Normal', description: 'No significant abnormalities detected', color: 'green' },
    'MCI': { label: 'Mild Cognitive Impairment', description: 'Early signs of cognitive changes detected', color: 'yellow' },
    'AD': { label: 'Alzheimer\'s Disease', description: 'Patterns consistent with AD pathology', color: 'red' }
  };

  const info = predictionInfo[prediction] || predictionInfo['CN'];
  const confidencePercent = Math.round(confidence * 100);
  const isNormal = prediction === 'CN';
  const isMCI = prediction === 'MCI';

  return (
    <SpotlightCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Latest Analysis Result</h3>
          <PulseRing color={isNormal ? 'green' : 'purple'} />
        </div>

        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${
            isNormal ? 'bg-green-500/10' : isMCI ? 'bg-yellow-500/10' : 'bg-red-500/10'
          }`}>
            <Brain className={`h-10 w-10 ${
              isNormal ? 'text-green-500' : isMCI ? 'text-yellow-500' : 'text-red-500'
            }`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${
              isNormal ? 'text-green-500' : isMCI ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {info.label}
            </p>
            <p className="text-sm text-muted-foreground">{info.description}</p>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className={`font-medium ${
              isNormal ? 'text-green-500' : isMCI ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {confidencePercent}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isNormal ? 'bg-green-500' : isMCI ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        {/* Probability Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {Object.entries(probabilities).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">{key}</span>
              <span className={`text-sm font-medium ${key === prediction ? 'text-primary' : 'text-muted-foreground'}`}>
                {Math.round(value * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}

// ============================================================================
// VIEW SCAN CARD COMPONENT
// ============================================================================
function ViewScanCard({ sessionId, sessionCode }: { sessionId: string; sessionCode: string }) {
  return (
    <SpotlightCard className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">View Your Scan</h3>
        <p className="text-sm text-muted-foreground">
          Access your brain scan images and explore the analysis results in detail.
        </p>
        <div className="p-4 bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground">Session: <span className="font-medium text-foreground">{sessionCode}</span></p>
        </div>
        <Button className="w-full" asChild>
          <Link href={`/patient/viewer/${sessionId}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Scan Images
          </Link>
        </Button>
      </div>
    </SpotlightCard>
  );
}

// ============================================================================
// SCAN HISTORY ROW COMPONENT
// ============================================================================
function ScanHistoryRow({
  session,
  onViewReport
}: {
  session: any;
  onViewReport: (session: any) => void;
}) {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    reviewed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    processing: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    uploaded: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    pending: { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted' }
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;
  const prediction = session.prediction?.prediction || session.prediction;
  const sessionCode = session.session_code || session.sessionCode;
  const scanDate = session.scan_date || session.scanDate;

  return (
    <div className="group p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{sessionCode}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(scanDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Prediction Badge */}
          {prediction && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              prediction === 'CN'
                ? 'bg-green-500/10 text-green-500'
                : prediction === 'MCI'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {prediction}
            </div>
          )}

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <span className={`text-sm font-medium capitalize ${status.color}`}>{session.status}</span>
          </div>

          {/* Actions - Always Visible */}
          {(session.status === 'completed' || session.status === 'reviewed') && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" asChild>
                <Link href={`/patient/viewer/${session.id}`}>
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button
                size="sm"
                variant="default"
                className="gap-1"
                onClick={() => onViewReport(session)}
              >
                <Download className="h-4 w-4" />
                Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DOCTOR INFO CARD COMPONENT
// ============================================================================
function DoctorInfoCard({ doctorName }: { doctorName: string }) {
  return (
    <FloatingCard>
      <SpotlightCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-blue-500/10">
            <Stethoscope className="h-8 w-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{doctorName}</h3>
            <p className="text-sm text-muted-foreground">Neurology Specialist</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your doctor will review your scan results and discuss the findings with you.
            </p>
          </div>
        </div>
      </SpotlightCard>
    </FloatingCard>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6">
      <div className="h-12 bg-muted rounded-lg w-1/3" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PATIENT DASHBOARD COMPONENT
// ============================================================================
export const PatientDashboard: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const { userProfile } = useAuth();

  // Fetch real data using API hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = usePatientStats();
  const { data: sessionsData, isLoading: sessionsLoading } = useMySessions();
  const { data: patientProfile } = useCurrentPatient();

  const sessions = sessionsData?.data || [];
  const latestSession = sessions[0];

  // Get patient name from auth context or API
  const patientName = userProfile?.full_name || patientProfile?.full_name || 'Patient';
  const patientCode = patientProfile?.patient_code || userProfile?.roleProfile?.patient_code || '';
  const assignedDoctor = patientProfile?.assigned_doctors?.[0]?.name || 'Not Assigned';

  // Only show skeleton for initial load if we have no data at all
  const hasNoData = !stats && !sessions.length;
  const isInitialLoading = (statsLoading || sessionsLoading) && hasNoData;

  if (isInitialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Content */}
      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <RevealOnScroll>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome, <span className="text-primary">{patientName}</span>
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-4">
                {patientCode && (
                  <>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {patientCode}
                    </span>
                    <span className="text-border">|</span>
                  </>
                )}
                <span>Assigned: {assignedDoctor}</span>
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Stats Grid */}
        <RevealOnScroll delay={100}>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Scans"
              value={stats?.totalScans || 0}
              icon={Activity}
              description="All-time scans"
              color="purple"
              isLoading={statsLoading}
            />
            <StatCard
              title="Completed Scans"
              value={stats?.completedScans || 0}
              icon={CheckCircle}
              description="Successfully analyzed"
              color="green"
              isLoading={statsLoading}
            />
            <StatCard
              title="Last Scan Date"
              value={stats?.latestScanDate ? new Date(stats.latestScanDate).toLocaleDateString() : 'N/A'}
              icon={Calendar}
              description="Most recent scan"
              color="blue"
              isLoading={statsLoading}
            />
          </div>
        </RevealOnScroll>

        {/* Latest Result & View Scan */}
        {latestSession && latestSession.prediction && (
          <RevealOnScroll delay={200}>
            <div className="grid gap-6 md:grid-cols-2">
              <PredictionDisplay
                prediction={latestSession.prediction.prediction || latestSession.prediction}
                probabilities={latestSession.prediction.probabilities || { CN: 0.25, MCI: 0.10, AD: 0.65 }}
                confidence={latestSession.prediction.confidence_score || 0.65}
              />
              <ViewScanCard
                sessionId={latestSession.id}
                sessionCode={latestSession.session_code}
              />
            </div>
          </RevealOnScroll>
        )}

        {/* Report Viewer for Latest Session */}
        {latestSession?.prediction && (
          <RevealOnScroll delay={300}>
            <SpotlightCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Latest Report</h3>
              </div>
              <ReportViewer
                sessionCode={latestSession.session_code}
                status={latestSession.status}
                reports={{
                  patient: latestSession.prediction.patient_pdf_url,
                  clinician: latestSession.prediction.clinician_pdf_url,
                  technical: latestSession.prediction.technical_pdf_url,
                }}
                userRole="patient"
                prediction={latestSession.prediction.prediction}
                confidence={latestSession.prediction.confidence_score}
              />
            </SpotlightCard>
          </RevealOnScroll>
        )}

        {/* Scan History */}
        <RevealOnScroll delay={400}>
          <SpotlightCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Scan History</h3>
              </div>
              <span className="text-sm text-muted-foreground">{sessions.length} scans</span>
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scans found</p>
                <p className="text-sm">Your MRI scan history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session: any) => (
                  <ScanHistoryRow
                    key={session.id}
                    session={session}
                    onViewReport={setSelectedSession}
                  />
                ))}
              </div>
            )}
          </SpotlightCard>
        </RevealOnScroll>

        {/* Doctor Information */}
        {assignedDoctor && assignedDoctor !== 'Not Assigned' && (
          <RevealOnScroll delay={500}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Stethoscope className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Your Assigned Doctor</h3>
              </div>
              <DoctorInfoCard doctorName={assignedDoctor} />
            </div>
          </RevealOnScroll>
        )}
      </div>

      {/* Floating Report Modal */}
      {selectedSession && selectedSession.prediction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto">
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Report - {selectedSession.session_code}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ReportViewer
                sessionCode={selectedSession.session_code}
                status={selectedSession.status}
                reports={{
                  patient: selectedSession.prediction.patient_pdf_url,
                  clinician: selectedSession.prediction.clinician_pdf_url,
                  technical: selectedSession.prediction.technical_pdf_url,
                }}
                userRole="patient"
                prediction={selectedSession.prediction.prediction}
                confidence={selectedSession.prediction.confidence_score}
              />
            </SpotlightCard>
          </div>
        </div>
      )}
    </div>
  );
};
