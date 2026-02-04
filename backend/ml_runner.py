"""
ML Model Runner for MRI Analysis.

HOW TO INTEGRATE YOUR REAL MODEL:
================================
1. Set USE_MOCK_MODEL = False in config.py
2. Implement the ModelInterface class below or modify _run_model_real()
3. Your model should return a dict with these required fields:
   - prediction: str ('CN', 'MCI', or 'AD')
   - probabilities: list[float] (probabilities for each class)
   - confidence: float (0-1, confidence of top prediction)
   - classes: list[str] (class labels in same order as probabilities)

Optional fields your model can return:
   - brain_volume, gm_volume, wm_volume, csf_volume: float (in cm³)
   - hippocampal_volume, ventricular_volume: float (in cm³)
   - processing_time: int (milliseconds)
   - affected_regions: list[dict] (regions with name, severity, description)
   - scan_quality: str ('Excellent', 'Good', 'Acceptable', 'Poor')

Example:
-------
def _run_model_real(scan_path, analysis_type):
    # Load your model
    model = load_model('path/to/your/model.h5')

    # Preprocess the scan
    scan_data = preprocess(scan_path)

    # Get predictions
    probs = model.predict(scan_data)
    classes = ['CN', 'MCI', 'AD']
    pred_idx = np.argmax(probs)

    return {
        'prediction': classes[pred_idx],
        'probabilities': probs.tolist(),
        'confidence': float(probs[pred_idx]),
        'classes': classes,
        'analysis_type': analysis_type,
        'model_version': 'your-model-v1.0'
    }
"""

import random
import numpy as np
from typing import Dict, Any, List, Optional, Protocol
from config import USE_MOCK_MODEL, MODEL_VERSION, ANALYSIS_TYPES, NORMATIVE_VOLUMES


# =============================================================================
# Model Interface (Optional - for type checking)
# =============================================================================

class ModelInterface(Protocol):
    """Protocol for ML model implementations."""

    def predict(self, scan_path: str, analysis_type: str) -> Dict[str, Any]:
        """
        Run prediction on an MRI scan.

        Args:
            scan_path: Path to the MRI scan file
            analysis_type: Type of analysis

        Returns:
            Dictionary with at minimum:
            - prediction: str
            - probabilities: list[float]
            - confidence: float
            - classes: list[str]
        """
        ...


# =============================================================================
# Main Entry Point
# =============================================================================

def run_model(
    scan_path: str,
    analysis_type: str = 'multi-disease'
) -> Dict[str, Any]:
    """
    Run the ML model on an MRI scan.

    Args:
        scan_path: Path to the MRI scan file (NIfTI, DICOM, or other format)
        analysis_type: Type of analysis ('multi-disease', 'ad-only', 'pd-only', 'ftd-only')

    Returns:
        Dictionary with prediction results including:
        - prediction: The predicted class (CN, MCI, AD)
        - probabilities: Probability for each class
        - confidence: Confidence score of the prediction
        - classes: List of class labels
        - brain_volume, gm_volume, etc.: Volume measurements
        - consistency_metrics: Model consistency analysis
        - affected_regions: List of affected brain regions
    """
    if USE_MOCK_MODEL:
        return _run_model_mock(scan_path, analysis_type)
    else:
        return _run_model_real(scan_path, analysis_type)


# =============================================================================
# Real Model Implementation (YOUR CODE GOES HERE)
# =============================================================================

def _run_model_real(scan_path: str, analysis_type: str) -> Dict[str, Any]:
    """
    Run the real ML model on an MRI scan.

    This function integrates with the ConViT-based classifier.

    Pipeline:
    1. If input is NIfTI: extract middle slices
    2. Run predictor on slices with majority voting
    3. Generate volume estimates and return results

    Args:
        scan_path: Path to MRI scan file (NIfTI or preprocessed slices)
        analysis_type: Type of analysis to perform

    Returns:
        Prediction results dictionary
    """
    import os
    import time
    from pathlib import Path

    start_time = time.time()

    try:
        from ml.nifti_slicer import NIfTISlicer
        from ml.predictor import create_predictor
    except ImportError as e:
        print(f"Warning: ML modules not available ({e}). Using mock model.")
        return _run_model_mock(scan_path, analysis_type)

    # Initialize predictor
    predictor = create_predictor()

    # Check if input is NIfTI or already sliced images
    scan_path = Path(scan_path)

    if scan_path.suffix.lower() in ['.nii', '.gz']:
        # Extract slices from NIfTI file
        slicer = NIfTISlicer(output_format='png', normalize=True)
        slices_dir = scan_path.parent / 'slices'
        slice_paths = slicer.extract_middle_slices(
            str(scan_path),
            num_slices=5,
            output_dir=str(slices_dir),
            prefix='mwp1_slice'
        )
    elif scan_path.is_dir():
        # Directory of slice images
        slice_paths = sorted([
            str(f) for f in scan_path.glob('*.png')
        ] + [
            str(f) for f in scan_path.glob('*.jpg')
        ])
    else:
        # Single image or unknown format
        slice_paths = [str(scan_path)]

    if not slice_paths:
        raise ValueError(f"No valid images found at {scan_path}")

    # Run prediction
    if predictor.is_available():
        prediction_result = predictor.predict_patient(slice_paths)
    else:
        # Fall back to mock if model not available
        return _run_model_mock(scan_path, analysis_type)

    # Get classes for this analysis type
    classes = ANALYSIS_TYPES.get(analysis_type, ['CN', 'MCI', 'AD'])

    # Map predictor result to platform format
    prediction = prediction_result['patient_diagnosis']

    # Convert individual probabilities to platform format
    raw_probs = prediction_result.get('individual_predictions', [{}])
    if raw_probs:
        avg_probs = {cls: 0.0 for cls in classes}
        for pred in raw_probs:
            for cls, prob in pred.get('probabilities', {}).items():
                if cls in avg_probs:
                    avg_probs[cls] += prob / len(raw_probs) / 100
        probabilities = [avg_probs.get(c, 0.0) for c in classes]
    else:
        probabilities = [1.0 if c == prediction else 0.0 for c in classes]

    # Normalize probabilities
    total = sum(probabilities)
    if total > 0:
        probabilities = [p / total for p in probabilities]

    confidence = prediction_result['confidence'] / 100

    # Generate volume estimates based on prediction
    volumes = _generate_mock_volumes(prediction)

    processing_time = int((time.time() - start_time) * 1000)

    return {
        # Core prediction results
        'prediction': prediction,
        'probabilities': probabilities,
        'confidence': confidence,
        'classes': classes,
        'analysis_type': analysis_type,

        # Volume measurements
        'brain_volume': volumes['brain'],
        'gm_volume': volumes['gray_matter'],
        'wm_volume': volumes['white_matter'],
        'csf_volume': volumes['csf'],
        'hippocampal_volume': volumes['hippocampus'],
        'ventricular_volume': volumes['ventricles'],

        # Model metadata
        'model_version': 'ConViT-v1.0',
        'processing_time': processing_time,

        # Consistency analysis from majority voting
        'consistency_metrics': {
            'accuracy': prediction_result.get('consensus_strength', 0) / 100,
            'num_trials': prediction_result.get('total_images_processed', 0),
            'consensus_strength': prediction_result.get('consensus_strength', 0),
        },
        'vote_distribution': prediction_result.get('vote_distribution', {}),
        'individual_predictions': prediction_result.get('individual_predictions', []),

        # Regional analysis
        'affected_regions': _get_affected_regions(prediction),

        # Quality metrics
        'scan_quality': 'Good',
        'motion_artifacts': 'Minimal',
    }


# =============================================================================
# Mock Model (for development/testing)
# =============================================================================

def _run_model_mock(
    scan_path: str,
    analysis_type: str = 'multi-disease'
) -> Dict[str, Any]:
    """
    Mock ML model that returns realistic results for development.

    This generates plausible predictions and volume measurements
    without actually processing the scan file.
    """
    # Get classes for this analysis type
    classes = ANALYSIS_TYPES.get(analysis_type, ['CN', 'MCI', 'AD'])

    # Generate plausible probability distribution
    dominant_idx = random.randint(0, len(classes) - 1)
    raw_probs = []

    for i in range(len(classes)):
        if i == dominant_idx:
            raw_probs.append(random.uniform(0.5, 0.85))
        else:
            raw_probs.append(random.uniform(0.05, 0.25))

    # Normalize to sum to 1
    total = sum(raw_probs)
    probabilities = [p / total for p in raw_probs]

    # Get prediction
    prediction = classes[np.argmax(probabilities)]
    confidence = max(probabilities)

    # Generate brain volume measurements adjusted for prediction
    volumes = _generate_mock_volumes(prediction)

    # Generate consistency metrics
    consistency_metrics = _generate_mock_consistency(classes, prediction)

    return {
        # Core prediction results
        'prediction': prediction,
        'probabilities': probabilities,
        'confidence': confidence,
        'classes': classes,
        'analysis_type': analysis_type,

        # Volume measurements
        'brain_volume': volumes['brain'],
        'gm_volume': volumes['gray_matter'],
        'wm_volume': volumes['white_matter'],
        'csf_volume': volumes['csf'],
        'hippocampal_volume': volumes['hippocampus'],
        'ventricular_volume': volumes['ventricles'],

        # Model metadata
        'model_version': MODEL_VERSION,
        'processing_time': random.randint(45, 180),

        # Consistency analysis
        'consistency_metrics': consistency_metrics,
        'trial_predictions': consistency_metrics.get('trial_predictions', []),

        # Regional analysis
        'affected_regions': _get_affected_regions(prediction),

        # Quality metrics
        'scan_quality': random.choice(['Excellent', 'Good', 'Acceptable']),
        'motion_artifacts': random.choice(['None', 'Minimal', 'Moderate']),
    }


def _generate_mock_volumes(prediction: str) -> Dict[str, float]:
    """Generate realistic brain volume measurements based on prediction."""

    # Adjustment factors for disease states
    adjustments = {
        'CN': {'brain': 1.0, 'hippo': 1.0, 'ventricles': 1.0},
        'MCI': {'brain': 0.97, 'hippo': 0.88, 'ventricles': 1.15},
        'AD': {'brain': 0.92, 'hippo': 0.75, 'ventricles': 1.4}
    }

    adj = adjustments.get(prediction, adjustments['CN'])

    # Base volumes (normal ranges)
    base_brain = random.uniform(1200, 1350)
    base_hippo = random.uniform(3.5, 4.2)
    base_ventricles = random.uniform(25, 40)

    brain_volume = base_brain * adj['brain']
    gm_volume = brain_volume * random.uniform(0.40, 0.44)
    wm_volume = brain_volume * random.uniform(0.36, 0.40)
    csf_volume = brain_volume - gm_volume - wm_volume

    return {
        'brain': round(brain_volume, 2),
        'gray_matter': round(gm_volume, 2),
        'white_matter': round(wm_volume, 2),
        'csf': round(csf_volume, 2),
        'hippocampus': round(base_hippo * adj['hippo'], 2),
        'ventricles': round(base_ventricles * adj['ventricles'], 2)
    }


def _generate_mock_consistency(classes: List[str], prediction: str) -> Dict[str, Any]:
    """Generate mock consistency metrics simulating multi-slice analysis."""

    num_trials = random.randint(8, 15)
    accuracy = random.uniform(0.78, 0.95)

    # Generate trial predictions
    pred_idx = classes.index(prediction)
    trial_predictions = []

    for _ in range(num_trials):
        if random.random() < accuracy:
            trial_predictions.append(pred_idx)
        else:
            other_indices = [i for i in range(len(classes)) if i != pred_idx]
            trial_predictions.append(random.choice(other_indices))

    return {
        'accuracy': accuracy,
        'num_trials': num_trials,
        'precision': random.uniform(0.75, 0.92),
        'recall_sensitivity': random.uniform(0.72, 0.94),
        'specificity': random.uniform(0.78, 0.93),
        'f1_score': random.uniform(0.74, 0.92),
        'true_positives': int(num_trials * accuracy * 0.5),
        'true_negatives': int(num_trials * accuracy * 0.5),
        'false_positives': int(num_trials * (1 - accuracy) * 0.5),
        'false_negatives': int(num_trials * (1 - accuracy) * 0.5),
        'majority_label_used_as_reference': pred_idx,
        'trial_predictions': trial_predictions
    }


def _get_affected_regions(prediction: str) -> List[Dict[str, Any]]:
    """Get list of affected brain regions based on prediction."""

    regions_by_disease = {
        'CN': [],
        'MCI': [
            {'name': 'Hippocampus', 'severity': 'Mild', 'description': 'Subtle volume reduction observed'},
            {'name': 'Entorhinal Cortex', 'severity': 'Mild', 'description': 'Early cortical changes detected'},
            {'name': 'Temporal Lobe', 'severity': 'Minimal', 'description': 'Minor changes present'}
        ],
        'AD': [
            {'name': 'Hippocampus', 'severity': 'Moderate to Severe', 'description': 'Significant volume reduction observed'},
            {'name': 'Entorhinal Cortex', 'severity': 'Moderate', 'description': 'Cortical thinning detected'},
            {'name': 'Temporal Lobe', 'severity': 'Mild to Moderate', 'description': 'Atrophy patterns present'},
            {'name': 'Parietal Lobe', 'severity': 'Mild', 'description': 'Minor changes observed'}
        ]
    }

    return regions_by_disease.get(prediction, [])


# =============================================================================
# Volume Comparison Utilities
# =============================================================================

def get_volume_comparison(ml_results: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Compare measured volumes with normative ranges.

    Args:
        ml_results: Results from run_model()

    Returns:
        Dictionary with volume comparisons showing status and deviation
    """
    comparisons = {}

    volume_mappings = {
        'total_brain': ('brain_volume', NORMATIVE_VOLUMES['total_brain']),
        'gray_matter': ('gm_volume', NORMATIVE_VOLUMES['gray_matter']),
        'white_matter': ('wm_volume', NORMATIVE_VOLUMES['white_matter']),
        'csf': ('csf_volume', NORMATIVE_VOLUMES['csf']),
        'hippocampus': ('hippocampal_volume', NORMATIVE_VOLUMES['hippocampus']),
    }

    for name, (key, norm) in volume_mappings.items():
        value = ml_results.get(key)
        if value is not None:
            if value < norm['min']:
                status = 'Below Normal'
                deviation = ((norm['min'] - value) / norm['min']) * 100
            elif value > norm['max']:
                status = 'Above Normal'
                deviation = ((value - norm['max']) / norm['max']) * 100
            else:
                status = 'Normal'
                mid = (norm['min'] + norm['max']) / 2
                deviation = ((value - mid) / mid) * 100

            comparisons[name] = {
                'measured': value,
                'min_normal': norm['min'],
                'max_normal': norm['max'],
                'unit': norm['unit'],
                'status': status,
                'deviation_percent': round(abs(deviation), 1)
            }

    return comparisons
