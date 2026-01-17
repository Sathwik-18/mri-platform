'use client';

import { Navbar } from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockDoctors, mockPatients } from '@/lib/mockData';
import { Upload, ArrowLeft, FileUp, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RadiologistUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedDoctor || !selectedPatient || !analysisType || selectedFiles.length === 0) {
      toast.error('Please fill all required fields and select at least one file');
      return;
    }

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      toast.success('MRI scan uploaded successfully! Processing will begin shortly.');
      setSelectedFiles([]);
      setSelectedDoctor('');
      setSelectedPatient('');
      setAnalysisType('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar userName="Dr. David Chen" userRole="radiologist" />
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/radiologist/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload New MRI Scan</h1>
            <p className="text-muted-foreground">
              Upload DICOM files for AI-powered neurodegenerative disease analysis
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>DICOM Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <FileUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm font-medium mb-1">Click to upload DICOM files</p>
                <p className="text-xs text-muted-foreground">
                  Supports .dcm, .dicom files or .zip archives
                </p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".dcm,.dicom,.zip"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-100 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Referring Doctor *</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.patientCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysisType">Analysis Type *</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multi-disease">
                      Multi-Disease (AD/PD/FTD/CN)
                    </SelectItem>
                    <SelectItem value="ad-only">Alzheimer's Only</SelectItem>
                    <SelectItem value="pd-only">Parkinson's Only</SelectItem>
                    <SelectItem value="ftd-only">FTD Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Session Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any relevant notes..."
                  className="h-20"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Session Duration (minutes)</Label>
              <Input id="duration" type="number" placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="electrodes">Number of Channels</Label>
              <Input id="electrodes" type="number" placeholder="19" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="samplingRate">Field Strength</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5T">1.5 Tesla</SelectItem>
                  <SelectItem value="3T">3 Tesla</SelectItem>
                  <SelectItem value="7T">7 Tesla</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Upload Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/radiologist/dashboard">Cancel</Link>
          </Button>
          <Button
            size="lg"
            onClick={handleUpload}
            disabled={uploading}
            className="min-w-40"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Ensure DICOM files are complete and uncorrupted</li>
              <li>Supported sequences: T1-weighted, T2-weighted, FLAIR</li>
              <li>Recommended resolution: 1mm isotropic or better</li>
              <li>Processing typically takes 3-5 minutes</li>
              <li>You'll receive a notification when analysis is complete</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
