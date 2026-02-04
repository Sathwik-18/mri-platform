'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDoctorStats, useMySessions, useCurrentDoctor } from '@/lib/hooks/useApi';
import { ReportViewer } from '@/components/shared/ReportViewer';
import type { MRISession } from '@/lib/api/sessions';
import {
  Users,
  ClipboardList,
  Activity,
  TrendingUp,
  Eye,
  Download,
  Search,
  Calendar,
  Brain,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  User,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  SpotlightCard,
  GradientText,
  AnimatedCounter,
  RevealOnScroll,
  AuroraBackground,
  GridPattern,
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
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'purple' | 'teal' | 'blue' | 'green' | 'orange';
}) {
  const colorStyles = {
    purple: 'from-purple-500 to-violet-500',
    teal: 'from-teal-500 to-cyan-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
  };

  const bgColorStyles = {
    purple: 'bg-purple-500/10',
    teal: 'bg-teal-500/10',
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    orange: 'bg-orange-500/10',
  };

  const iconColors = {
    purple: '#a855f7',
    teal: '#14b8a6',
    blue: '#3b82f6',
    green: '#22c55e',
    orange: '#f97316',
  };

  return (
    <SpotlightCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            {typeof value === 'number' ? (
              <span
                className={`text-3xl font-bold bg-gradient-to-r ${colorStyles[color]} bg-clip-text text-transparent`}
              >
                <AnimatedCounter value={value} />
              </span>
            ) : (
              <span
                className={`text-2xl font-bold bg-gradient-to-r ${colorStyles[color]} bg-clip-text text-transparent`}
              >
                {value}
              </span>
            )}
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '+' : '-'}
                {trend.value}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColorStyles[color]}`}>
          <Icon className="h-6 w-6" style={{ color: iconColors[color] }} />
        </div>
      </div>
    </SpotlightCard>
  );
}

// ============================================================================
// CUSTOM TOOLTIP FOR CHARTS
// ============================================================================
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-purple-400 text-sm">{payload[0].value} scans</p>
      </div>
    );
  }
  return null;
}

// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================
function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// ============================================================================
// PATIENT ROW COMPONENT
// ============================================================================
interface PatientRowData {
  id: string;
  name: string;
  patientCode: string;
  latestScanStatus: string | null;
  latestPrediction: string | null;
}

function PatientRow({ patient }: { patient: PatientRowData }) {
  return (
    <Link href={`/doctor/patient/${patient.id}`}>
      <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">{patient.name}</p>
              <p className="text-sm text-slate-400">
                {patient.patientCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">Latest Status</p>
              <p className="text-sm text-white capitalize">{patient.latestScanStatus || 'N/A'}</p>
            </div>
            {patient.latestPrediction && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patient.latestPrediction === 'CN'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {patient.latestPrediction}
              </div>
            )}
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// SCAN ROW COMPONENT
// ============================================================================
function ScanRow({
  session,
  onViewReport,
  showRadiologist = false,
}: {
  session: MRISession;
  onViewReport: (session: MRISession) => void;
  showRadiologist?: boolean;
}) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    reviewed: {
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    processing: {
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    uploaded: {
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  };

  const status =
    statusConfig[session.status as keyof typeof statusConfig] ||
    statusConfig.processing;
  const StatusIcon = status.icon;

  const patientName = session.patient?.user_profile?.full_name || 'Unknown Patient';
  const radiologistName = session.radiologist?.user_profile?.full_name;
  const prediction = session.prediction?.prediction;
  const confidence = session.prediction?.confidence_score;

  return (
    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-teal-500/10">
            <Brain className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-white">{session.session_code}</p>
            <p className="text-sm text-slate-400">
              {patientName} | {new Date(session.scan_date).toLocaleDateString()}
              {showRadiologist && radiologistName && (
                <span> | {radiologistName}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Prediction Badge */}
          {prediction && (
            <div className="text-right">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  prediction === 'CN'
                    ? 'bg-green-500/10 text-green-400'
                    : prediction === 'MCI'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {prediction}
              </div>
              {confidence && (
                <p className="text-xs text-slate-500 mt-1">
                  {(confidence * 100).toFixed(1)}% confidence
                </p>
              )}
            </div>
          )}

          {/* Status Badge */}
          {!prediction && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
              <span className={`text-sm font-medium capitalize ${status.color}`}>
                {session.status}
              </span>
            </div>
          )}

          {/* Actions - Always Visible */}
          {(session.status === 'completed' || session.status === 'reviewed') && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                asChild
              >
                <Link href={`/doctor/viewer/${session.id}`}>
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                onClick={() => onViewReport(session)}
              >
                <Download className="h-4 w-4" />
                Reports
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON COMPONENTS
// ============================================================================
function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-slate-700 rounded" />
          <div className="h-8 w-16 bg-slate-600 rounded" />
          <div className="h-3 w-24 bg-slate-700 rounded" />
        </div>
        <div className="h-12 w-12 bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-700 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-600 rounded" />
            <div className="h-3 w-24 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-slate-700 rounded-full" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DOCTOR DASHBOARD COMPONENT
// ============================================================================
export const DoctorDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'pending' | 'recent'>(
    'patients'
  );
  const [selectedSession, setSelectedSession] = useState<MRISession | null>(null);

  // Fetch real data from API
  const { data: stats, isLoading: statsLoading, error: statsError } = useDoctorStats();
  const { data: sessionsData, isLoading: sessionsLoading } = useMySessions();
  const { data: doctorProfile } = useCurrentDoctor();

  // Process sessions data
  const sessions = sessionsData?.data || [];

  // Calculate result distribution from stats (3 classes: CN, MCI, AD)
  const resultDistribution = useMemo(() => {
    if (!stats?.resultDistribution) {
      return [
        { name: 'CN', value: 0, color: '#22c55e' },
        { name: 'MCI', value: 0, color: '#f59e0b' },
        { name: 'AD', value: 0, color: '#ef4444' },
      ];
    }
    return [
      { name: 'CN', value: stats.resultDistribution.CN || 0, color: '#22c55e' },
      { name: 'MCI', value: stats.resultDistribution.MCI || 0, color: '#f59e0b' },
      { name: 'AD', value: stats.resultDistribution.AD || 0, color: '#ef4444' },
    ];
  }, [stats?.resultDistribution]);

  // Filter patients from stats
  const filteredPatients = useMemo(() => {
    const patients = stats?.recentPatients || [];
    if (!searchTerm) return patients;
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stats?.recentPatients, searchTerm]);

  // Get pending reviews (completed but not reviewed)
  const pendingReviews = useMemo(() => {
    return sessions.filter((s) => s.status === 'completed').slice(0, 5);
  }, [sessions]);

  // Get doctor name
  const doctorName = doctorProfile?.user_profile?.full_name || 'Doctor';
  const specialization = doctorProfile?.specialization || 'General';

  // Progressive loading - show content even if API fails
  // Only show loading skeleton briefly, then show empty state
  const isLoading = statsLoading && sessionsLoading && !stats && sessions.length === 0;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Effects */}
      <AuroraBackground />
      <GridPattern />

      {/* Content */}
      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <RevealOnScroll>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                <GradientText
                  from="from-purple-400"
                  via="via-violet-400"
                  to="to-teal-400"
                >
                  Doctor Dashboard
                </GradientText>
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-4">
                <span>Welcome, Dr. {doctorName}</span>
                <span className="text-muted">|</span>
                <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                  {specialization}
                </span>
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Error State */}
        {statsError && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            Failed to load dashboard data: {statsError}
          </div>
        )}

        {/* Stats Grid */}
        <RevealOnScroll delay={100}>
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Total Patients"
                  value={stats?.totalPatients || 0}
                  icon={Users}
                  description="Assigned to you"
                  color="purple"
                />
                <StatCard
                  title="Pending Reviews"
                  value={stats?.pendingReviews || 0}
                  icon={ClipboardList}
                  description="Requiring attention"
                  color="orange"
                />
                <StatCard
                  title="Completed Reviews"
                  value={stats?.completedReviews || 0}
                  icon={Activity}
                  description="All-time reviewed"
                  color="teal"
                />
                <StatCard
                  title="This Month"
                  value={stats?.thisMonthScans || 0}
                  icon={TrendingUp}
                  description="Scans this month"
                  color="green"
                />
              </>
            )}
          </div>
        </RevealOnScroll>

        {/* Analytics Charts */}
        <RevealOnScroll delay={200}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Diagnosis Distribution */}
            <SpotlightCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <PieChartIcon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Diagnosis Distribution
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={resultDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="transparent"
                  >
                    {resultDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {resultDistribution.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            {/* Monthly Trend */}
            <SpotlightCard className="p-6" spotlightColor="rgba(20, 184, 166, 0.15)">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <BarChart3 className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Monthly Scan Trend
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="scans"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </SpotlightCard>
          </div>
        </RevealOnScroll>

        {/* Tabs */}
        <RevealOnScroll delay={300}>
          <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05] w-fit">
            <TabButton
              active={activeTab === 'patients'}
              onClick={() => setActiveTab('patients')}
              icon={Users}
            >
              My Patients
            </TabButton>
            <TabButton
              active={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
              icon={ClipboardList}
            >
              Pending Reviews
            </TabButton>
            <TabButton
              active={activeTab === 'recent'}
              onClick={() => setActiveTab('recent')}
              icon={Calendar}
            >
              Recent Scans
            </TabButton>
          </div>
        </RevealOnScroll>

        {/* Tab Content */}
        <RevealOnScroll delay={400}>
          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Patient List</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-9 bg-white/[0.02] border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-purple-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No patients found matching your search' : 'No patients assigned yet'}
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))
                )}
              </div>
            </SpotlightCard>
          )}

          {/* Pending Reviews Tab */}
          {activeTab === 'pending' && (
            <SpotlightCard className="p-6" spotlightColor="rgba(249, 115, 22, 0.15)">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <ClipboardList className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Scans Requiring Review
                </h3>
                <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
                  {pendingReviews.length} pending
                </span>
              </div>

              <div className="space-y-3">
                {sessionsLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No scans pending review
                  </div>
                ) : (
                  pendingReviews.map((session) => (
                    <ScanRow
                      key={session.id}
                      session={session}
                      onViewReport={setSelectedSession}
                    />
                  ))
                )}
              </div>
            </SpotlightCard>
          )}

          {/* Recent Scans Tab */}
          {activeTab === 'recent' && (
            <SpotlightCard className="p-6" spotlightColor="rgba(20, 184, 166, 0.15)">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <Calendar className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Recent MRI Scans</h3>
              </div>

              <div className="space-y-3">
                {sessionsLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No MRI scans found
                  </div>
                ) : (
                  sessions.slice(0, 5).map((session) => (
                    <ScanRow
                      key={session.id}
                      session={session}
                      onViewReport={setSelectedSession}
                      showRadiologist
                    />
                  ))
                )}
              </div>
            </SpotlightCard>
          )}
        </RevealOnScroll>
      </div>

      {/* Floating Report Modal */}
      {selectedSession && selectedSession.prediction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto">
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Reports - {selectedSession.session_code}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                  className="hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ReportViewer
                sessionCode={selectedSession.session_code}
                status={selectedSession.status}
                reports={{
                  patient: selectedSession.prediction.patient_pdf_url || undefined,
                  clinician: selectedSession.prediction.clinician_pdf_url || undefined,
                  technical: selectedSession.prediction.technical_pdf_url || undefined,
                }}
                userRole="doctor"
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
