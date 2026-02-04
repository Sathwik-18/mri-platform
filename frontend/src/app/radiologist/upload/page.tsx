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
import { useAuth } from '@/components/providers/AuthProvider';
import { Upload, ArrowLeft, FileUp, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/withAuth';
import { createClient } from '@/lib/supabase/client';

interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
}

interface Doctor {
  id: string;
  doctor_code: string;
  full_name: string;
  specialization: string;
}

function RadiologistUploadPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [analysisType, setAnalysisType] = useState('multi-disease');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');

  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      setLoadingData(true);

      try {
        // First check if we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoadingData(false);
          return;
        }

        // Get patient profiles
        const { data: patientsData, error: patientsError } = await supabase
          .from('patient_profiles')
          .select('id, patient_code, user_id')
          .limit(100);

        if (!patientsError && patientsData && patientsData.length > 0) {
          // Get user names separately
          const userIds = patientsData.map(p => p.user_id);
          const { data: usersData } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', userIds);

          const userMap = new Map(usersData?.map(u => [u.id, u.full_name]) || []);

          const formattedPatients = patientsData.map((p: any) => ({
            id: p.id,
            patient_code: p.patient_code,
            full_name: userMap.get(p.user_id) || `Patient ${p.patient_code}`
          }));
          setPatients(formattedPatients);
        }

        // Get doctor profiles
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctor_profiles')
          .select('id, doctor_code, specialization, user_id')
          .limit(100);

        if (!doctorsError && doctorsData && doctorsData.length > 0) {
          // Get user names separately
          const userIds = doctorsData.map(d => d.user_id);
          const { data: usersData } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', userIds);

          const userMap = new Map(usersData?.map(u => [u.id, u.full_name]) || []);

          const formattedDoctors = doctorsData.map((d: any) => ({
            id: d.id,
            doctor_code: d.doctor_code,
            full_name: userMap.get(d.user_id) || `Doctor ${d.doctor_code}`,
            specialization: d.specialization || ''
          }));
          setDoctors(formattedDoctors);
        }
      } catch (err) {
        // Silently handle fetch errors
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(f => {
        const name = f.name.toLowerCase();
        return name.endsWith('.dcm') ||
          name.endsWith('.dicom') ||
          name.endsWith('.zip') ||
          name.endsWith('.nii') ||
          name.endsWith('.nii.gz') ||
          name.endsWith('.gz');
      });
      if (validFiles.length < filesArray.length) {
        toast.warning('Some files were skipped (unsupported format)');
      }
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedPatient || selectedFiles.length === 0) {
      toast.error('Please select a patient and at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress('uploading');

    try {
      const supabase = createClient();

      // Get current user's radiologist profile
      const { data: radProfile } = await supabase
        .from('radiologist_profiles')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      // Create session in database
      const { data: session, error: sessionError } = await supabase
        .from('mri_sessions')
        .insert({
          patient_id: selectedPatient,
          doctor_id: selectedDoctor || null,
          radiologist_id: radProfile?.id || null,
          scan_date: new Date().toISOString(),
          status: 'uploaded',
          session_code: `MRI-${Date.now()}`,
          analysis_type: analysisType,
          notes: notes || null
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error('Failed to create session: ' + sessionError.message);
      }

      setUploadProgress('processing');

      // Upload file to backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      formData.append('session_id', session.id);
      formData.append('analysis_type', analysisType);

      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadProgress('success');
      toast.success('MRI scan uploaded! Analysis is in progress.');

      setTimeout(() => {
        router.push('/radiologist/dashboard');
      }, 2000);

    } catch (error) {
      setUploadProgress('error');
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = useCallback(() => {
    setSelectedFiles([]);
    setSelectedDoctor('');
    setSelectedPatient('');
    setAnalysisType('multi-disease');
    setNotes('');
    setUploadProgress('idle');
    setUploading(false);
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6 space-y-6 max-w-4xl mx-auto pt-24">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/radiologist/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Upload MRI Scan</h1>
            <p className="text-sm text-muted-foreground">
              Upload NIfTI or DICOM files for AI analysis
            </p>
          </div>
        </div>

        {/* Success State */}
        {uploadProgress === 'success' && (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-500">Upload Successful!</h3>
                <p className="text-sm text-green-400">Redirecting to dashboard...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {uploadProgress === 'error' && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-500">Upload Failed</h3>
                  <p className="text-sm text-red-400">Please try again.</p>
                </div>
              </div>
              <Button variant="outline" onClick={resetForm}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {uploadProgress !== 'success' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>MRI Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary cursor-pointer transition-colors"
                  onClick={() => document.getElementById('file-input')?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const input = document.getElementById('file-input') as HTMLInputElement;
                      if (input) {
                        const dt = new DataTransfer();
                        Array.from(files).forEach(f => dt.items.add(f));
                        input.files = dt.files;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    }
                  }}
                >
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click or drag files to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    .nii, .nii.gz, .dcm, .dicom
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected ({selectedFiles.length})</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <span className="truncate flex-1">{file.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
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
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Loading..." : patients.length === 0 ? "No patients found" : "Select patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} ({patient.patient_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!loadingData && patients.length === 0 && (
                    <p className="text-xs text-muted-foreground">No patients available</p>
                  )}
                </div>

                {/* Doctor Selection */}
                <div className="space-y-2">
                  <Label>Referring Doctor (Optional)</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Loading..." : doctors.length === 0 ? "No doctors found" : "Select doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analysis Type */}
                <div className="space-y-2">
                  <Label>Analysis Type *</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multi-disease">Multi-Disease (AD/MCI/CN)</SelectItem>
                      <SelectItem value="ad-only">Alzheimer's Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="Add session notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Button */}
        {uploadProgress !== 'success' && (
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/radiologist/dashboard">Cancel</Link>
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0 || !selectedPatient}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploadProgress === 'uploading' ? 'Uploading...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-400 mb-2">Guidelines</h3>
            <ul className="text-sm text-blue-300 space-y-1 list-disc list-inside">
              <li>Supports: NIfTI (.nii, .nii.gz), DICOM (.dcm)</li>
              <li>Recommended: T1-weighted MRI</li>
              <li>Processing takes 3-5 minutes</li>
              <li>PDF reports generated automatically</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(RadiologistUploadPage, { allowedRoles: ['radiologist', 'admin'] });
