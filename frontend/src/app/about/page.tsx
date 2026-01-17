'use client';

import { Navbar } from '@/components/shared/Navbar';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About NeuroScope</h1>
          <div className="prose dark:prose-invert">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              NeuroScope is an AI-powered platform for early detection of neurodegenerative diseases
              through MRI brain scan analysis.
            </p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300">
              To provide accessible, accurate, and early diagnosis of Alzheimer's Disease, Parkinson's Disease,
              and Frontotemporal Dementia using state-of-the-art artificial intelligence.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
