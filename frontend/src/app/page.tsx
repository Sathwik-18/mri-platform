'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainIcon, PatientIcon, DoctorIcon, RadiologistIcon, AdminIcon } from '@/components/icons';
import { Navbar } from '@/components/shared/Navbar';
import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';

export default function Home() {
  const roles = [
    {
      title: 'Patient Portal',
      description: 'View your scan results, download reports, and track your health journey',
      icon: PatientIcon,
      href: '/patient/dashboard',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800',
    },
    {
      title: 'Doctor Dashboard',
      description: 'Review patient scans, manage assessments, and provide diagnoses',
      icon: DoctorIcon,
      href: '/doctor/dashboard',
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-800',
    },
    {
      title: 'Radiologist Workstation',
      description: 'Upload MRI scans, process imaging data, and generate technical reports',
      icon: RadiologistIcon,
      href: '/radiologist/dashboard',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800',
    },
    {
      title: 'Admin Control Panel',
      description: 'Manage users, assign patients, and oversee system operations',
      icon: AdminIcon,
      href: '/admin/dashboard',
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-800',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-24">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Siddhi 4.0 Technology</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Advanced AI-Driven MRI Diagnostic Platform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Comprehensive neurodegenerative disease detection using state-of-the-art deep learning.
            Supporting Alzheimer's, Parkinson's, and Frontotemporal Dementia diagnosis.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow-sm border">
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">Multi-Disease Detection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow-sm border">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow-sm border">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">Real-time Analysis</span>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Select Your Role to Continue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link key={role.href} href={role.href}>
                  <Card className={`h-full transition-all duration-300 hover:shadow-xl cursor-pointer border-2 ${role.color}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-background rounded-lg shadow-sm border">
                            <Icon size={32} className="text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{role.title}</CardTitle>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription className="mt-2">{role.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Multi-Disease Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simultaneous detection of Alzheimer's Disease, Parkinson's Disease, and Frontotemporal Dementia
                  with high accuracy and confidence scores.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5 text-primary" />
                  3D DICOM Viewer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced multi-planar reconstruction with annotation tools, measurements, and GradCAM
                  explainability maps for transparent AI decisions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Secure & Compliant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade security with role-based access control, encrypted storage, and full HIPAA
                  compliance for patient data protection.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 NeuroScope. Powered by Siddhi 4.0 AI Technology. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            For research and clinical use. Consult with healthcare professionals for medical decisions.
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}
