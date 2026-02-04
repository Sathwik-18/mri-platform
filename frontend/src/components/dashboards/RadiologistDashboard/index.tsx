'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRadiologistStats, useMySessions, useDoctors, useDeleteSession } from '@/lib/hooks/useApi';
import { toast } from 'sonner';
import { ReportViewer } from '@/components/shared/ReportViewer';
import type { MRISession } from '@/lib/api/sessions';
import type { Doctor } from '@/lib/api/doctors';
import {
  Upload,
  Activity,
  Clock,
  CheckCircle2,
  Eye,
  Download,
  Search,
  Brain,
  FileText,
  X,
  ChevronRight,
  Users,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
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
// QUICK ACTION BUTTON COMPONENT
// ============================================================================
function QuickActionButton({
  icon: Icon,
  label,
  description,
  href,
  color = 'purple',
  primary = false,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  color?: 'purple' | 'teal' | 'blue';
  primary?: boolean;
}) {
  const colorStyles = {
    purple: 'from-purple-500 to-violet-500',
    teal: 'from-teal-500 to-cyan-500',
    blue: 'from-blue-500 to-indigo-500',
  };

  const bgColorStyles = {
    purple: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    teal: 'bg-teal-500/10 group-hover:bg-teal-500/20',
    blue: 'bg-blue-500/10 group-hover:bg-blue-500/20',
  };

  const iconColors = {
    purple: '#a855f7',
    teal: '#14b8a6',
    blue: '#3b82f6',
  };

  const content = (
    <SpotlightCard
      className={`p-6 h-full cursor-pointer group ${
        primary ? 'border-purple-500/30' : ''
      }`}
      spotlightColor={`rgba(${color === 'purple' ? '168, 85, 247' : color === 'teal' ? '20, 184, 166' : '59, 130, 246'}, 0.15)`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-4 rounded-2xl transition-all duration-300 ${bgColorStyles[color]} ${
            primary ? `bg-gradient-to-r ${colorStyles[color]}` : ''
          }`}
        >
          <Icon
            className="h-6 w-6"
            style={{ color: primary ? 'white' : iconColors[color] }}
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
            {label}
          </p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
      </div>
    </SpotlightCard>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
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
          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// ============================================================================
// SESSION ROW COMPONENT
// ============================================================================
function SessionRow({
  session,
  onViewReport,
  onDelete,
  compact = false,
}: {
  session: MRISession;
  onViewReport: (session: MRISession) => void;
  onDelete?: (sessionId: string) => void;
  compact?: boolean;
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
      icon: Loader2,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      animate: true,
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

  const patientName = session.patient?.user_profile?.full_name || 'Unknown';
  const doctorName = session.doctor?.user_profile?.full_name || 'N/A';
  const prediction = session.prediction?.prediction;

  return (
    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-teal-500/30 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-teal-500/10">
            <Brain className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{session.session_code}</p>
            <p className="text-sm text-muted-foreground">
              {patientName}
              {!compact && <span> | {doctorName}</span>}
              {!compact && <span> | {new Date(session.scan_date).toLocaleDateString()}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Scanner Info */}
          {!compact && session.scanner_manufacturer && (
            <div className="text-right hidden lg:block">
              <p className="text-xs text-muted-foreground">Scanner</p>
              <p className="text-sm text-muted-foreground">
                {session.scanner_manufacturer}
              </p>
            </div>
          )}

          {/* Prediction Badge */}
          {prediction && (
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
          )}

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
            <StatusIcon
              className={`h-4 w-4 ${status.color} ${'animate' in status && status.animate ? 'animate-spin' : ''}`}
            />
            <span className={`text-sm font-medium capitalize ${status.color}`}>
              {session.status}
            </span>
          </div>

          {/* Actions - Always Visible */}
          <div className="flex gap-2">
            {(session.status === 'completed' || session.status === 'reviewed') && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                  asChild
                >
                  <Link href={`/radiologist/viewer/${session.id}`}>
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => onViewReport(session)}
                >
                  <Download className="h-4 w-4" />
                  Reports
                </Button>
              </>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-red-500/10"
                onClick={() => onDelete(session.id)}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DOCTOR CARD COMPONENT
// ============================================================================
function DoctorCard({
  doctor,
  selected,
  onClick,
}: {
  doctor: Doctor;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        selected
          ? 'bg-purple-500/10 border border-purple-500/30'
          : 'bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              selected
                ? 'bg-purple-500/20'
                : 'bg-gradient-to-br from-purple-500/10 to-violet-500/10'
            }`}
          >
            <Stethoscope
              className={`h-5 w-5 ${selected ? 'text-purple-400' : 'text-purple-400'}`}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{doctor.full_name || doctor.user_profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {doctor.specialization} | {doctor.license_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Specialization</p>
            <p className="font-medium text-purple-400">{doctor.specialization}</p>
          </div>
          <ChevronRight
            className={`h-5 w-5 transition-all ${
              selected
                ? 'text-purple-400 rotate-90'
                : 'text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROCESSING CARD COMPONENT
// ============================================================================
function ProcessingCard({ session }: { session: MRISession }) {
  const patientName = session.patient?.user_profile?.full_name || 'Unknown';
  const doctorName = session.doctor?.user_profile?.full_name || 'N/A';

  return (
    <SpotlightCard className="p-6" spotlightColor="rgba(234, 179, 8, 0.15)">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10">
            <Brain className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{session.session_code}</p>
            <p className="text-sm text-muted-foreground">
              {patientName} | {doctorName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10">
          <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
          <span className="text-sm font-medium text-yellow-400">Processing</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 animate-pulse"
            style={{ width: '75%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Analyzing MRI data...</span>
          <span>Est. 2-3 minutes</span>
        </div>
      </div>
    </SpotlightCard>
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
// MAIN RADIOLOGIST DASHBOARD COMPONENT
// ============================================================================
export const RadiologistDashboard: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'doctors' | 'processing'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<MRISession | null>(null);

  // Fetch real data from API
  const { data: stats, isLoading: statsLoading, error: statsError } = useRadiologistStats();
  const { data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions } = useMySessions();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const { deleteSession, isLoading: deleteLoading } = useDeleteSession();

  // Handle delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }
    const success = await deleteSession(sessionId);
    if (success) {
      toast.success('Session deleted successfully');
      refetchSessions();
    } else {
      toast.error('Failed to delete session');
    }
  };

  // Process sessions data
  const allSessions = sessionsData?.data || [];
  const doctors = doctorsData?.data || [];

  // Filter sessions by selected doctor
  const sessions = useMemo(() => {
    if (!selectedDoctor) return allSessions;
    return allSessions.filter((s) => s.doctor_id === selectedDoctor);
  }, [allSessions, selectedDoctor]);

  // Filter sessions by search
  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;
    const term = searchTerm.toLowerCase();
    return sessions.filter((s) =>
      s.session_code.toLowerCase().includes(term) ||
      s.patient?.user_profile?.full_name?.toLowerCase().includes(term)
    );
  }, [sessions, searchTerm]);

  // Get processing sessions
  const processingSessions = useMemo(() => {
    return allSessions.filter((s) => s.status === 'processing');
  }, [allSessions]);

  // Progressive loading - show content even if API fails
  // Only show loading skeleton briefly, then show empty state
  const isLoading = statsLoading && sessionsLoading && !stats && allSessions.length === 0;

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
                  from="from-teal-400"
                  via="via-cyan-400"
                  to="to-purple-400"
                >
                  Radiologist Dashboard
                </GradientText>
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-4">
                <span>Welcome, Radiologist</span>
                <span className="text-muted">|</span>
                <span className="px-2 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium">
                  Radiology Department
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
          <div className="grid gap-4 md:grid-cols-3">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Total Scans"
                  value={stats?.totalScans || 0}
                  icon={Activity}
                  description="All-time processed"
                  color="teal"
                />
                <StatCard
                  title="Processing Queue"
                  value={stats?.processingScans || 0}
                  icon={Clock}
                  description="Currently processing"
                  color="orange"
                />
                <StatCard
                  title="Completed Today"
                  value={stats?.completedToday || 0}
                  icon={CheckCircle2}
                  description="Finished today"
                  color="green"
                />
              </>
            )}
          </div>
        </RevealOnScroll>

        {/* Quick Actions */}
        <RevealOnScroll delay={200}>
          <div className="grid gap-4 md:grid-cols-2">
            <QuickActionButton
              icon={Upload}
              label="Upload New Scan"
              description="Add MRI scan to the system"
              href="/radiologist/upload"
              color="teal"
              primary
            />
            <QuickActionButton
              icon={Layers}
              label="View All Sessions"
              description="Browse completed and processing scans"
              color="purple"
            />
          </div>
        </RevealOnScroll>

        {/* Tabs */}
        <RevealOnScroll delay={300}>
          <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05] w-fit">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => {
                setActiveTab('all');
                setSelectedDoctor(null);
              }}
              icon={Layers}
            >
              All Sessions
            </TabButton>
            <TabButton
              active={activeTab === 'doctors'}
              onClick={() => setActiveTab('doctors')}
              icon={Users}
            >
              By Doctor
            </TabButton>
            <TabButton
              active={activeTab === 'processing'}
              onClick={() => setActiveTab('processing')}
              icon={Clock}
            >
              Processing ({processingSessions.length})
            </TabButton>
          </div>
        </RevealOnScroll>

        {/* Tab Content */}
        <RevealOnScroll delay={400}>
          {/* All Sessions Tab */}
          {activeTab === 'all' && (
            <SpotlightCard className="p-6" spotlightColor="rgba(20, 184, 166, 0.15)">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <Layers className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    All MRI Sessions
                  </h3>
                  <span className="px-2 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium">
                    {filteredSessions.length} sessions
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    className="pl-9 bg-white/[0.02] border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-teal-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {sessionsLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No sessions found matching your search' : 'No MRI sessions found'}
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      onViewReport={setSelectedSession}
                      onDelete={handleDeleteSession}
                    />
                  ))
                )}
              </div>
            </SpotlightCard>
          )}

          {/* By Doctor Tab */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <SpotlightCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Referring Doctors
                  </h3>
                </div>

                <div className="space-y-3">
                  {doctorsLoading ? (
                    <>
                      <RowSkeleton />
                      <RowSkeleton />
                    </>
                  ) : doctors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No doctors found
                    </div>
                  ) : (
                    doctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        selected={selectedDoctor === doctor.id}
                        onClick={() =>
                          setSelectedDoctor(
                            selectedDoctor === doctor.id ? null : doctor.id
                          )
                        }
                      />
                    ))
                  )}
                </div>
              </SpotlightCard>

              {/* Sessions for Selected Doctor */}
              {selectedDoctor && (
                <SpotlightCard className="p-6" spotlightColor="rgba(20, 184, 166, 0.15)">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10">
                        <Brain className="h-5 w-5 text-teal-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Sessions for{' '}
                        {doctors.find((d) => d.id === selectedDoctor)?.full_name ||
                          doctors.find((d) => d.id === selectedDoctor)?.user_profile?.full_name}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoctor(null)}
                      className="hover:bg-white/10 text-muted-foreground"
                    >
                      Clear Filter
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {sessions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No sessions for this doctor
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <SessionRow
                          key={session.id}
                          session={session}
                          onViewReport={setSelectedSession}
                          onDelete={handleDeleteSession}
                          compact
                        />
                      ))
                    )}
                  </div>
                </SpotlightCard>
              )}
            </div>
          )}

          {/* Processing Tab */}
          {activeTab === 'processing' && (
            <SpotlightCard className="p-6" spotlightColor="rgba(234, 179, 8, 0.15)">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Processing Queue
                </h3>
                <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                  {processingSessions.length} active
                </span>
              </div>

              {sessionsLoading ? (
                <div className="space-y-4">
                  <RowSkeleton />
                  <RowSkeleton />
                </div>
              ) : processingSessions.length > 0 ? (
                <div className="space-y-4">
                  {processingSessions.map((session) => (
                    <ProcessingCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-muted-foreground">No scans currently processing</p>
                  <p className="text-sm text-muted mt-1">
                    All scans have been completed
                  </p>
                </div>
              )}
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
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <FileText className="h-5 w-5 text-teal-400" />
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
                userRole="radiologist"
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
