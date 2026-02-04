"""
Configuration settings for the MRI Platform Backend.
Loads environment variables and defines constants.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =============================================================================
# Supabase Configuration
# =============================================================================
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

# =============================================================================
# Storage Buckets
# =============================================================================
MRI_SCANS_BUCKET = 'mri-scans'
REPORT_ASSETS_BUCKET = 'report-assets'

# =============================================================================
# File Paths
# =============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =============================================================================
# ML Model Configuration
# =============================================================================
USE_MOCK_MODEL = True  # Set to False when real model is ready
MODEL_VERSION = 'mock-v1.0' if USE_MOCK_MODEL else 'mri-classifier-v1.0'

# Reference data paths (for similarity analysis when real model is ready)
REFERENCE_DATA_DIR = os.path.join(BASE_DIR, 'reference_data')
CN_REFERENCE_PATH = os.path.join(REFERENCE_DATA_DIR, 'cn_reference.npy')
MCI_REFERENCE_PATH = os.path.join(REFERENCE_DATA_DIR, 'mci_reference.npy')
AD_REFERENCE_PATH = os.path.join(REFERENCE_DATA_DIR, 'ad_reference.npy')

# =============================================================================
# Prediction Classes (Model outputs these 3 classes)
# =============================================================================
PREDICTION_CLASSES = ['CN', 'MCI', 'AD']

# =============================================================================
# Analysis Types
# =============================================================================
ANALYSIS_TYPES = {
    'multi-disease': ['CN', 'MCI', 'AD'],
    'ad-only': ['CN', 'AD']
}

# =============================================================================
# Disease Labels and Descriptions
# =============================================================================
DISEASE_INFO = {
    'CN': {
        'full_name': 'Cognitively Normal',
        'description': 'No significant neurodegenerative patterns detected',
        'color': (46, 204, 113),  # Green
        'hex_color': '#2ecc71'
    },
    'MCI': {
        'full_name': 'Mild Cognitive Impairment',
        'description': 'Early signs of cognitive decline, may or may not progress to dementia',
        'color': (241, 196, 15),  # Yellow
        'hex_color': '#f1c40f'
    },
    'AD': {
        'full_name': "Alzheimer's Disease",
        'description': 'Patterns consistent with Alzheimer\'s disease pathology',
        'color': (231, 76, 60),  # Red
        'hex_color': '#e74c3c'
    }
}

# =============================================================================
# Normative Brain Volume Ranges (in cm³)
# Reference values for healthy adults aged 60-80
# =============================================================================
NORMATIVE_VOLUMES = {
    'total_brain': {'min': 1100, 'max': 1400, 'unit': 'cm³'},
    'gray_matter': {'min': 450, 'max': 600, 'unit': 'cm³'},
    'white_matter': {'min': 400, 'max': 550, 'unit': 'cm³'},
    'csf': {'min': 150, 'max': 300, 'unit': 'cm³'},
    'hippocampus': {'min': 3.0, 'max': 4.5, 'unit': 'cm³'},
    'ventricles': {'min': 20, 'max': 50, 'unit': 'cm³'}
}

# =============================================================================
# Flask Configuration
# =============================================================================
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size

# =============================================================================
# CORS Configuration
# =============================================================================
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    os.getenv('FRONTEND_URL', 'http://localhost:3000')
]
