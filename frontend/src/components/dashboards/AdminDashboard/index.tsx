'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminStats, useUsers, useDoctors, usePatients, useUpdateUserStatus, useAssignPatient, useAllAssignments } from '@/lib/hooks/useApi';
import type { User as ApiUser } from '@/lib/api/users';
import type { Doctor } from '@/lib/api/doctors';
import type { Patient } from '@/lib/api/patients';
import {
  Users,
  UserPlus,
  Activity,
  Shield,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Search,
  Settings,
  FileText,
  ChevronRight,
  User,
  Stethoscope,
  Brain,
  Crown,
  X,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
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
  color?: 'purple' | 'teal' | 'blue' | 'green' | 'orange' | 'red';
}) {
  const colorStyles = {
    purple: 'from-purple-500 to-violet-500',
    teal: 'from-teal-500 to-cyan-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
  };

  const bgColorStyles = {
    purple: 'bg-purple-500/10',
    teal: 'bg-teal-500/10',
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    orange: 'bg-orange-500/10',
    red: 'bg-red-500/10',
  };

  const iconColors = {
    purple: '#a855f7',
    teal: '#14b8a6',
    blue: '#3b82f6',
    green: '#22c55e',
    orange: '#f97316',
    red: '#ef4444',
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
// ROLE DISTRIBUTION CARD
// ============================================================================
function RoleCard({
  label,
  value,
  icon: Icon,
  change,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  change: string;
  color: 'purple' | 'teal' | 'blue' | 'green' | 'orange';
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
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl ${bgColorStyles[color]}`}
        >
          <Icon className="h-6 w-6" style={{ color: iconColors[color] }} />
        </div>
        <span className="text-sm text-green-400 font-medium">{change}</span>
      </div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p
        className={`text-3xl font-bold bg-gradient-to-r ${colorStyles[color]} bg-clip-text text-transparent`}
      >
        <AnimatedCounter value={value} />
      </p>
    </SpotlightCard>
  );
}

// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================
function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ElementType;
  badge?: number;
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
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
          {badge}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// USER ROW COMPONENT
// ============================================================================
function UserRow({
  user,
  onSuspend,
  onActivate,
}: {
  user: ApiUser;
  onSuspend?: (id: string) => void;
  onActivate?: (id: string) => void;
}) {
  const roleIcons = {
    admin: Crown,
    doctor: Stethoscope,
    radiologist: Brain,
    patient: User,
  };

  const roleColors = {
    admin: 'bg-orange-500/10 text-orange-400',
    doctor: 'bg-green-500/10 text-green-400',
    radiologist: 'bg-teal-500/10 text-teal-400',
    patient: 'bg-blue-500/10 text-blue-400',
  };

  const statusColors = {
    active: 'bg-green-500/10 text-green-400',
    suspended: 'bg-red-500/10 text-red-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
  };

  const role = user.role || 'patient';
  const RoleIcon = roleIcons[role as keyof typeof roleIcons] || User;
  const roleColor = roleColors[role as keyof typeof roleColors] || roleColors.patient;
  const statusColor = statusColors[user.account_status as keyof typeof statusColors] || statusColors.pending;

  return (
    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${roleColor.split(' ')[0]}`}>
            <RoleIcon className={`h-5 w-5 ${roleColor.split(' ')[1]}`} />
          </div>
          <div>
            <p className="font-medium text-foreground">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${roleColor}`}>
            {role}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColor}`}>
            {user.account_status}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="hover:bg-purple-500/10">
              <Edit className="h-4 w-4 text-purple-400" />
            </Button>
            {user.account_status === 'active' ? (
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-red-500/10"
                onClick={() => onSuspend?.(user.id)}
              >
                <XCircle className="h-4 w-4 text-red-400" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-green-500/10"
                onClick={() => onActivate?.(user.id)}
              >
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </Button>
            )}
          </div>
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
// VERIFICATION CARD COMPONENT
// ============================================================================
function VerificationCard({ doctor }: { doctor: Doctor }) {
  const doctorName = doctor.full_name || doctor.user_profile?.full_name || 'Unknown';

  return (
    <SpotlightCard className="p-6" spotlightColor="rgba(249, 115, 22, 0.15)">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-orange-500/10">
            <Stethoscope className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{doctorName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                {doctor.specialization}
              </span>
              <span className="text-sm text-muted-foreground">
                License: <span className="font-mono text-muted-foreground">{doctor.license_number}</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Experience: {doctor.experience_years || 0} years
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0"
          >
            <XCircle className="mr-1 h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
}

// ============================================================================
// REPORT CARD COMPONENT
// ============================================================================
function ReportCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  change: string;
  icon: React.ElementType;
  color: 'purple' | 'teal' | 'orange';
}) {
  const bgColors = {
    purple: 'bg-purple-500/10',
    teal: 'bg-teal-500/10',
    orange: 'bg-orange-500/10',
  };

  const iconColors = {
    purple: '#a855f7',
    teal: '#14b8a6',
    orange: '#f97316',
  };

  return (
    <SpotlightCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${bgColors[color]}`}>
          <Icon className="h-5 w-5" style={{ color: iconColors[color] }} />
        </div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white mb-2">
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      </p>
      <div className="flex items-center gap-1 text-sm text-green-400">
        <TrendingUp className="h-4 w-4" />
        <span>{change}</span>
      </div>
    </SpotlightCard>
  );
}

// ============================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// ============================================================================
export const AdminDashboard: React.FC = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'verify' | 'assign' | 'reports'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  // Fetch real data from API
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUsers({ pageSize: 50 });
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({ pageSize: 50 });
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ pageSize: 50 });
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useAllAssignments({ pageSize: 50 });
  const { suspendUser, activateUser, isLoading: statusLoading } = useUpdateUserStatus();
  const { assignPatient, isLoading: assignLoading, error: assignError } = useAssignPatient();

  // Process data
  const users = usersData?.data || [];
  const doctors = doctorsData?.data || [];
  const patients = patientsData?.data || [];
  const assignments = assignmentsData?.data || [];

  // Role stats from API
  const roleStats = useMemo(() => [
    { label: 'Patients', value: stats?.totalPatients || 0, icon: Users, change: '+12%', color: 'blue' as const },
    { label: 'Doctors', value: stats?.totalDoctors || 0, icon: Stethoscope, change: '+2', color: 'green' as const },
    { label: 'Radiologists', value: stats?.totalRadiologists || 0, icon: Brain, change: '0', color: 'teal' as const },
    { label: 'Admins', value: stats?.totalAdmins || 0, icon: Crown, change: '+1', color: 'orange' as const },
  ], [stats]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Handle user status changes
  const handleSuspendUser = async (userId: string) => {
    await suspendUser(userId);
    refetchUsers();
  };

  const handleActivateUser = async (userId: string) => {
    await activateUser(userId);
    refetchUsers();
  };

  // Handle patient assignment
  const handleAssignPatient = async () => {
    if (selectedDoctor && selectedPatient) {
      const result = await assignPatient(selectedDoctor, selectedPatient);
      if (result) {
        setSelectedDoctor('');
        setSelectedPatient('');
        refetchAssignments();
      }
    }
  };

  // Progressive loading - show content even if API fails
  // Only show loading skeleton briefly, then show empty state
  const isLoading = statsLoading && usersLoading && !stats && users.length === 0;

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
                  from="from-orange-400"
                  via="via-amber-400"
                  to="to-purple-400"
                >
                  System Administration
                </GradientText>
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage users, permissions, and hospital operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New User</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Add a new user to the system. Select their role and provide necessary information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName" className="text-muted-foreground">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        className="bg-white/[0.02] border-white/[0.08] text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-white/[0.02] border-white/[0.08] text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role" className="text-muted-foreground">Role</Label>
                      <Select>
                        <SelectTrigger className="bg-white/[0.02] border-white/[0.08] text-foreground">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="radiologist">Radiologist</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        className="bg-white/[0.02] border-white/[0.08] text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateUserOpen(false)}
                      className="border-border text-muted-foreground hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setIsCreateUserOpen(false)}
                      className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0"
                    >
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </RevealOnScroll>

        {/* Error State */}
        {statsError && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            Failed to load dashboard data: {statsError}
          </div>
        )}

        {/* Main Stats */}
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
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  icon={Users}
                  description="All roles combined"
                  color="purple"
                />
                <StatCard
                  title="Pending Actions"
                  value={stats?.pendingVerifications || 0}
                  icon={AlertCircle}
                  description="Require attention"
                  color="orange"
                />
                <StatCard
                  title="Monthly Scans"
                  value={stats?.scansThisMonth || 0}
                  icon={Activity}
                  description="Hospital-wide"
                  color="teal"
                />
                <StatCard
                  title="Active Users"
                  value={stats?.activeUsers || 0}
                  icon={Shield}
                  description="Currently active"
                  color="green"
                />
              </>
            )}
          </div>
        </RevealOnScroll>

        {/* Role Distribution */}
        <RevealOnScroll delay={200}>
          <div className="grid gap-4 md:grid-cols-4">
            {roleStats.map((stat, idx) => (
              <RoleCard key={idx} {...stat} />
            ))}
          </div>
        </RevealOnScroll>

        {/* Tabs */}
        <RevealOnScroll delay={300}>
          <div className="flex items-center gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05] w-fit">
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={Users}
            >
              All Users
            </TabButton>
            <TabButton
              active={activeTab === 'verify'}
              onClick={() => setActiveTab('verify')}
              icon={AlertCircle}
              badge={stats?.pendingVerifications || 0}
            >
              Verifications
            </TabButton>
            <TabButton
              active={activeTab === 'assign'}
              onClick={() => setActiveTab('assign')}
              icon={UserPlus}
            >
              Assignments
            </TabButton>
            <TabButton
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
              icon={FileText}
            >
              Reports
            </TabButton>
          </div>
        </RevealOnScroll>

        {/* Tab Content */}
        <RevealOnScroll delay={400}>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">User Management</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9 bg-white/[0.02] border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40 bg-white/[0.02] border-white/[0.08] text-foreground">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="radiologist">Radiologist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                {usersLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onSuspend={handleSuspendUser}
                      onActivate={handleActivateUser}
                    />
                  ))
                )}
              </div>
            </SpotlightCard>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verify' && (
            <SpotlightCard className="p-6" spotlightColor="rgba(249, 115, 22, 0.15)">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Pending Verifications</h3>
                <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">
                  {stats?.pendingVerifications || 0} pending
                </span>
              </div>

              <div className="space-y-4">
                {doctorsLoading ? (
                  <>
                    <RowSkeleton />
                    <RowSkeleton />
                  </>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending verifications
                  </div>
                ) : (
                  doctors.slice(0, 5).map((doctor) => (
                    <VerificationCard key={doctor.id} doctor={doctor} />
                  ))
                )}
              </div>
            </SpotlightCard>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assign' && (
            <SpotlightCard className="p-6" spotlightColor="rgba(59, 130, 246, 0.15)">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Assign Patients to Doctors</h3>
              </div>

              {assignError && (
                <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {assignError}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Select Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger className="bg-white/[0.02] border-white/[0.08] text-foreground">
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {doctorsLoading ? (
                        <SelectItem value="" disabled>Loading...</SelectItem>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-green-400" />
                              {doctor.full_name || doctor.user_profile?.full_name} - {doctor.specialization}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Select Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="bg-white/[0.02] border-white/[0.08] text-foreground">
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {patientsLoading ? (
                        <SelectItem value="" disabled>Loading...</SelectItem>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-400" />
                              {patient.full_name || patient.user_profile?.full_name} - {patient.patient_code}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                onClick={handleAssignPatient}
                disabled={!selectedDoctor || !selectedPatient || assignLoading}
              >
                {assignLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Assign Patient to Doctor
              </Button>

              {/* Existing Assignments */}
              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Current Assignments</h4>
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                    {assignments.length} active
                  </span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {assignmentsLoading ? (
                    <>
                      <RowSkeleton />
                      <RowSkeleton />
                      <RowSkeleton />
                    </>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No patient-doctor assignments found
                    </div>
                  ) : (
                    assignments.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <Stethoscope className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{assignment.doctor_name}</p>
                              <p className="text-xs text-muted-foreground">{assignment.doctor_specialization}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{assignment.patient_name}</p>
                              <p className="text-xs text-muted-foreground">{assignment.patient_code}</p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SpotlightCard>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <ReportCard
                  title="System Activity"
                  value={stats?.scansThisMonth || 0}
                  change="+12% from last month"
                  icon={Activity}
                  color="teal"
                />
                <ReportCard
                  title="Active Users"
                  value={stats?.activeUsers || 0}
                  change="+8% growth"
                  icon={Users}
                  color="purple"
                />
                <ReportCard
                  title="Pending Items"
                  value={stats?.pendingVerifications || 0}
                  change="Require attention"
                  icon={AlertCircle}
                  color="orange"
                />
              </div>

              <SpotlightCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Generate Reports</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Export comprehensive reports for analysis and compliance
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Usage Report
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    User Statistics
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Audit Log
                  </Button>
                </div>
              </SpotlightCard>
            </div>
          )}
        </RevealOnScroll>
      </div>
    </div>
  );
};
