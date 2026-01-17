# NeuroScope - AI-Powered MRI Diagnostics Platform

## Project Vision & Ultimate Aim

NeuroScope is an advanced web-based platform designed to revolutionize neurodegenerative disease diagnosis through AI-powered MRI brain scan analysis. Our vision is to create a comprehensive, hospital-grade system that enables early detection and monitoring of multiple neurodegenerative diseases including Alzheimer's Disease (AD), Parkinson's Disease (PD), and Frontotemporal Dementia (FTD).

### Core Mission
- **Early Detection**: Identify neurodegenerative diseases at early stages when intervention is most effective
- **Multi-Disease Analysis**: Single platform supporting multiple neurodegenerative conditions
- **Clinical Workflow Integration**: Seamlessly fit into existing hospital radiology and neurology workflows
- **Patient Empowerment**: Provide patients with understandable, visual explanations of their brain health
- **AI Explainability**: Not just predictions - show doctors and patients WHY the AI made its decision

### Key Differentiators
1. **Multi-Class Disease Detection**: Unlike single-disease systems, we detect CN (Cognitively Normal), AD, PD, and FTD from a single scan
2. **Role-Based Workflows**: Tailored interfaces for Patients, Doctors, Radiologists, and Admins
3. **Advanced DICOM Viewing**: Professional-grade MRI viewer using Cornerstone.js with MPR (Multi-Planar Reconstruction)
4. **Explainable AI**: Heatmaps and region highlighting showing which brain areas influenced the diagnosis
5. **3D Brain Visualization**: Interactive 3D brain models with highlighted affected regions
6. **Longitudinal Tracking**: Monitor disease progression over time with comparative analysis

---

## User Roles & Workflows

### 1. **Radiologist**
- **Primary Function**: Upload and process MRI scans
- **Workflow**:
  1. Upload DICOM files (T1, T2, FLAIR sequences)
  2. Select patient, referring doctor, and analysis type
  3. System processes scan through AI pipeline
  4. Review results in advanced workstation
  5. Generate technical radiology report
  6. Send results to referring doctor

### 2. **Doctor (Neurologist/Physician)**
- **Primary Function**: Review results and manage patients
- **Workflow**:
  1. View assigned patients
  2. Review AI predictions and reports
  3. Compare scans over time (progression tracking)
  4. Access clinical reports with treatment recommendations
  5. Schedule follow-ups or additional tests

### 3. **Patient**
- **Primary Function**: Access their own brain scan results
- **Workflow**:
  1. View simplified MRI visualization
  2. Read patient-friendly explanation of findings
  3. Download reports
  4. Track their scan history

### 4. **Admin**
- **Primary Function**: User management and system oversight
- **Workflow**:
  1. Create new user accounts (patients, doctors, radiologists)
  2. Assign doctors to patients
  3. Manage hospital/clinic information
  4. View system-wide analytics and statistics

---

## Technical Architecture

### Frontend Stack
```
Next.js 16.0.10 (App Router)
├── React 19.2.1
├── TypeScript
├── Tailwind CSS 4
├── Shadcn UI Components
├── Cornerstone.js (DICOM Viewer)
├── next-themes (Dark/Light Mode)
└── Supabase Client (@supabase/ssr)
```

### Backend & Database
```
Supabase (PostgreSQL + Auth + Storage)
├── Row Level Security (RLS)
├── Real-time subscriptions
├── Storage buckets (DICOM files, reports)
└── Edge Functions (future: AI processing)
```

### AI/ML Pipeline (Future)
```
Python/Flask Backend
├── PyTorch
├── 3D CNN Models (AD/PD/FTD classifiers)
├── Grad-CAM for explainability
├── DICOM preprocessing (nibabel, nilearn)
└── Brain segmentation (FreeSurfer/FSL)
```

---

## Database Schema Overview

### Core Tables
- **user_profiles**: All users (linked to Supabase Auth)
- **patient_profiles**: Patient demographics, medical history
- **doctor_profiles**: Doctor credentials, specialization
- **radiologist_profiles**: Radiologist credentials, certifications
- **admin_profiles**: Admin permissions

### Clinical Data
- **mri_sessions**: Uploaded scans, metadata, status
- **mri_predictions**: AI results (prediction, confidence, probabilities)
- **reports**: Generated PDF reports (clinical, technical, patient)
- **doctor_assignments**: Which doctors can access which patients

### Reference Data
- **hospitals**: Hospital/clinic information
- **blood_groups**: Blood type lookup
- **qualifications**: Medical degree lookup

See `database/01-create-tables.sql` for complete schema.

---

## Authentication & Security

### Authentication Flow
1. **Admin Creates User**:
   - Admin fills form with user details
   - System generates random 12-character password
   - Creates Supabase Auth user + profile
   - Emails credentials to user (future: nodemailer)

2. **First Login**:
   - User logs in with temporary password
   - System detects `first_login: true` in metadata
   - Forces password change
   - Updates `first_login: false`

3. **Subsequent Logins**:
   - Standard email/password authentication
   - Redirects to role-specific dashboard

### Security Features
- **Row Level Security (RLS)**: Patients only see their data, doctors only see assigned patients
- **Service Role Key**: Admin operations bypass RLS (used carefully)
- **Middleware Protection**: Auto-redirects unauthenticated users to login
- **Role-Based Access Control**: Each role has specific permissions

---

## Key Features Breakdown

### 1. **Advanced MRI Viewer** (Cornerstone.js)
- Multi-planar reconstruction (Axial, Sagittal, Coronal views)
- Slice scrolling and animation
- Windowing (brightness/contrast adjustment)
- Zoom and pan
- Measurements and annotations (for radiologists)
- DICOM metadata display
- 3D volume rendering (future)

### 2. **AI Prediction System**
- **Input**: 3D MRI brain scan (T1-weighted preferred)
- **Output**:
  - Prediction: CN / AD / PD / FTD
  - Confidence Score: 0-100%
  - Probabilities: Distribution across all classes
  - Affected Regions: Hippocampus (AD), Substantia Nigra (PD), Frontal Lobes (FTD)

### 3. **Explainability & Visualization**
- **Heatmaps**: Grad-CAM overlays showing important brain regions
- **Region Highlighting**: Color-coded affected areas
- **Volumetric Analysis**: Brain volume, GM/WM/CSF volumes, hippocampal volume
- **Comparison Views**: Side-by-side current vs previous scans

### 4. **Report Generation**
- **Technical Report** (for radiologists): Detailed metrics, quality control, scan parameters
- **Clinical Report** (for doctors): Diagnosis, affected regions, treatment recommendations
- **Patient Summary** (for patients): Simplified explanation with visual aids

### 5. **Disease Progression Tracking**
- Timeline charts showing prediction changes over time
- Volumetric trend analysis
- Visual comparison of multiple scans
- Early warning alerts for deterioration

---

## Development Roadmap

### Phase 1: Foundation (COMPLETED)
- [x] Next.js 16 project setup with TypeScript
- [x] Tailwind CSS 4 + Shadcn UI integration
- [x] Dark/Light mode toggle
- [x] All 4 role dashboards (mock data)
- [x] Mock MRI viewer component
- [x] Basic routing and navigation

### Phase 2: Database & Auth (IN PROGRESS)
- [x] Supabase project setup
- [x] Database schema design & creation
- [x] Row Level Security policies
- [x] Authentication system (login, password change)
- [x] AuthProvider with role detection
- [x] Admin user creation API
- [ ] Email sending for credentials
- [ ] Admin UI for user management

### Phase 3: Real Data Integration (NEXT)
- [ ] Connect dashboards to Supabase
- [ ] Fetch patients, doctors, sessions from DB
- [ ] Doctor-patient assignments
- [ ] Real user profiles with edit functionality
- [ ] Session creation and status updates

### Phase 4: DICOM Upload & Storage
- [ ] File upload UI for radiologists
- [ ] DICOM validation and parsing
- [ ] Supabase Storage integration
- [ ] Metadata extraction
- [ ] File compression and optimization

### Phase 5: AI Integration
- [ ] Python Flask backend setup
- [ ] DICOM preprocessing pipeline
- [ ] Load pre-trained models (AD/PD/FTD)
- [ ] API endpoints for prediction
- [ ] Async task queue (Celery/Redis)
- [ ] Grad-CAM explainability generation

### Phase 6: Advanced Features
- [ ] Real Cornerstone.js DICOM viewer
- [ ] 3D brain rendering
- [ ] Comparative scan viewer
- [ ] Progression timeline charts
- [ ] PDF report generation
- [ ] Email notifications

### Phase 7: Production Ready
- [ ] Performance optimization
- [ ] Security audit
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Deployment (Vercel + Supabase)
- [ ] Monitoring and analytics

---

## Project Structure

```
mri-platform/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── login/          # Login page
│   │   │   ├── change-password/
│   │   │   ├── patient/        # Patient dashboard & pages
│   │   │   ├── doctor/         # Doctor dashboard & pages
│   │   │   ├── radiologist/    # Radiologist dashboard & pages
│   │   │   ├── admin/          # Admin dashboard & pages
│   │   │   └── api/            # API routes
│   │   ├── components/
│   │   │   ├── dashboards/     # Role-specific dashboards
│   │   │   ├── shared/         # Navbar, Footer, etc.
│   │   │   ├── viewers/        # MRI viewer components
│   │   │   ├── providers/      # AuthProvider, etc.
│   │   │   └── ui/             # Shadcn components
│   │   └── lib/
│   │       ├── supabase/       # Supabase clients
│   │       └── mockData.ts     # Mock data for development
│   ├── public/                 # Static assets
│   └── .env.local             # Environment variables
├── database/                   # Database scripts
│   ├── 01-create-tables.sql
│   ├── 02-rls-policies.sql
│   └── seed-data.js
└── README.md
```

---

## Environment Setup

### Prerequisites
- Node.js 18+ (for Next.js)
- Python 3.9+ (for AI backend - future)
- Supabase account
- Git

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run `database/01-create-tables.sql`
3. Run `database/02-rls-policies.sql`
4. Create storage buckets: `mri-scans`, `reports`

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
```

---

## Learning Resources

### Technologies Used
- **Next.js 15 Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Cornerstone.js**: https://www.cornerstonejs.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn UI**: https://ui.shadcn.com/

### Medical Imaging
- **DICOM Standard**: https://www.dicomstandard.org/
- **nibabel (Python)**: https://nipy.org/nibabel/
- **nilearn**: https://nilearn.github.io/

### AI/ML for Medical Imaging
- **3D CNN Architectures**: ResNet3D, DenseNet3D
- **Grad-CAM**: https://arxiv.org/abs/1610.02391
- **Medical Image Analysis**: https://www.sciencedirect.com/journal/medical-image-analysis

---

## Success Metrics

### Technical Goals
- [ ] < 2s page load time
- [ ] 99.9% uptime
- [ ] < 5min AI processing time per scan
- [ ] Support 1000+ concurrent users

### Clinical Goals
- [ ] 90%+ prediction accuracy (validated against clinical diagnosis)
- [ ] Early detection 6-12 months before symptom onset
- [ ] Reduce radiologist report time by 50%
- [ ] Enable monitoring of 10,000+ patients
