'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { withAuth } from '@/lib/withAuth';
import { Navbar } from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Activity,
  Users,
  FileText,
  Calendar,
  Upload,
  Eye,
  BarChart3,
  Settings,
  ClipboardList,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  SpotlightCard,
  AnimatedCounter,
  RevealOnScroll,
  PulseRing,
} from '@/components/ui/animated';

// ============================================================================
// STAT CARD
// ============================================================================
function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  delay = 0,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  trend?: string;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <SpotlightCard className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-semibold text-foreground mb-1">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && (
          <p className="text-xs text-primary mt-3 font-medium">{trend}</p>
        )}
      </SpotlightCard>
    </RevealOnScroll>
  );
}

// ============================================================================
// ACTION CARD
// ============================================================================
function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <Link href={href} className="block group">
        <SpotlightCard className="p-6 h-full">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
          </div>
        </SpotlightCard>
      </Link>
    </RevealOnScroll>
  );
}

// ============================================================================
// MAIN HOME PAGE
// ============================================================================
function HomePage() {
  const { userProfile } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const firstName = userProfile?.full_name?.split(' ')[0] || 'User';
  const role = userProfile?.role || 'patient';

  // Role-specific configurations
  const roleConfigs = {
    patient: {
      actions: [
        {
          icon: FileText,
          title: 'My Scan Results',
          description: 'View your MRI analysis history and reports',
          href: '/patient/dashboard',
        },
        {
          icon: Calendar,
          title: 'Appointments',
          description: 'Schedule and manage your scan appointments',
          href: '/patient/dashboard',
        },
        {
          icon: Users,
          title: 'Care Team',
          description: 'Connect with your assigned doctors',
          href: '/patient/dashboard',
        },
      ],
      metrics: [
        { icon: Activity, value: 3, label: 'Total Scans', trend: '+1 this month' },
        { icon: FileText, value: 2, label: 'Reports Ready' },
        { icon: Calendar, value: 1, label: 'Upcoming' },
      ],
    },
    doctor: {
      actions: [
        {
          icon: Users,
          title: 'Patient List',
          description: 'Manage and review your assigned patients',
          href: '/doctor/dashboard',
        },
        {
          icon: ClipboardList,
          title: 'Pending Reviews',
          description: 'MRI results awaiting your assessment',
          href: '/doctor/dashboard',
        },
        {
          icon: BarChart3,
          title: 'Analytics',
          description: 'View patient outcomes and trends',
          href: '/doctor/dashboard',
        },
      ],
      metrics: [
        { icon: Users, value: 24, label: 'Active Patients' },
        { icon: ClipboardList, value: 5, label: 'Pending Reviews', trend: '3 urgent' },
        { icon: Activity, value: 89, label: 'Total Scans' },
      ],
    },
    radiologist: {
      actions: [
        {
          icon: Upload,
          title: 'Upload New Scan',
          description: 'Submit MRI scans for AI analysis',
          href: '/radiologist/upload',
        },
        {
          icon: Eye,
          title: 'View Analyses',
          description: 'Review completed scans and predictions',
          href: '/radiologist/dashboard',
        },
        {
          icon: FileText,
          title: 'Reports Queue',
          description: 'Pending reports requiring review',
          href: '/radiologist/dashboard',
        },
      ],
      metrics: [
        { icon: Activity, value: 156, label: 'Scans Processed' },
        { icon: Clock, value: 12, label: 'In Queue', trend: '4 priority' },
        { icon: BarChart3, value: 98, label: 'Accuracy %' },
      ],
    },
    admin: {
      actions: [
        {
          icon: Users,
          title: 'User Management',
          description: 'Manage doctors, radiologists, and patients',
          href: '/admin/dashboard',
        },
        {
          icon: Settings,
          title: 'System Settings',
          description: 'Configure platform and access controls',
          href: '/admin/dashboard',
        },
        {
          icon: BarChart3,
          title: 'System Analytics',
          description: 'Platform metrics and usage reports',
          href: '/admin/dashboard',
        },
      ],
      metrics: [
        { icon: Users, value: 48, label: 'Total Users', trend: '+5 this week' },
        { icon: Activity, value: 342, label: 'Total Scans' },
        { icon: BarChart3, value: 3, label: 'Hospitals' },
      ],
    },
  };

  const config = roleConfigs[role as keyof typeof roleConfigs] || roleConfigs.patient;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  <span className="mx-2">|</span> {currentTime}
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                  {greeting}, <span className="text-primary">{firstName}</span>
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <PulseRing color="green" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  System Online
                </span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Welcome Card */}
          <RevealOnScroll delay={100}>
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex p-4 rounded-2xl bg-primary/10">
                  <Brain className="w-12 h-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Welcome to NeuroScope
                  </h2>
                  <p className="text-muted-foreground">
                    Your AI-powered neurological diagnostics platform. Access your dashboard
                    for detailed insights and management tools.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href={`/${role}/dashboard`}>
                    Open Dashboard
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Metrics */}
          <RevealOnScroll delay={200}>
            <h3 className="text-lg font-medium text-foreground mb-4">Overview</h3>
          </RevealOnScroll>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {config.metrics.map((metric, index) => (
              <StatCard
                key={metric.label}
                icon={metric.icon}
                value={metric.value}
                label={metric.label}
                trend={metric.trend}
                delay={250 + index * 50}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <RevealOnScroll delay={400}>
            <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-4">
            {config.actions.map((action, index) => (
              <ActionCard
                key={action.title}
                icon={action.icon}
                title={action.title}
                description={action.description}
                href={action.href}
                delay={450 + index * 50}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomePage);
