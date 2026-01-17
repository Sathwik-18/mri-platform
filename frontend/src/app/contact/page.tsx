'use client';

import { Navbar } from '@/components/shared/Navbar';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              For support, inquiries, or more information about NeuroScope:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">support@neuroscope.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Phone</h3>
                <p className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Address</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  123 Medical Center Drive<br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
