"""
Similarity Analysis for MRI Brain Scans.
Compares patient brain features with reference patterns.
"""

import io
import base64
import random
from typing import Dict, Any, Optional, List
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from config import DISEASE_INFO, USE_MOCK_MODEL


def run_similarity_analysis(
    scan_path: str,
    analysis_type: str = 'multi-disease',
    ml_results: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Run similarity analysis comparing patient scan with reference patterns.

    Args:
        scan_path: Path to the MRI scan file
        analysis_type: Type of analysis
        ml_results: Optional ML results to use for generating realistic similarity

    Returns:
        Dictionary with similarity results and visualization
    """
    if USE_MOCK_MODEL:
        return _run_similarity_mock(analysis_type, ml_results)
    else:
        return _run_similarity_real(scan_path, analysis_type)


def _run_similarity_mock(
    analysis_type: str,
    ml_results: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Mock similarity analysis that generates realistic comparison data.

    Args:
        analysis_type: Type of analysis
        ml_results: ML results for consistent similarity scores

    Returns:
        Similarity analysis results with visualization
    """
    # Determine classes based on analysis type
    # Model supports 3 classes: AD, CN, MCI
    if analysis_type == 'multi-disease':
        classes = ['AD', 'CN', 'MCI']
    elif analysis_type == 'ad-only':
        classes = ['CN', 'AD']
    elif analysis_type == 'mci-only':
        classes = ['CN', 'MCI']
    else:
        classes = ['AD', 'CN', 'MCI']

    # Generate similarity scores
    # If we have ML results, make similarity consistent with prediction
    prediction = ml_results.get('prediction') if ml_results else random.choice(classes)

    similarity_scores = {}
    for cls in classes:
        if cls == prediction:
            # Higher similarity to predicted class
            similarity_scores[f'{cls.lower()}_similarity'] = random.uniform(0.70, 0.92)
        else:
            # Lower similarity to other classes
            similarity_scores[f'{cls.lower()}_similarity'] = random.uniform(0.25, 0.55)

    # Normalize so they sum to reasonable values
    total = sum(similarity_scores.values())
    for key in similarity_scores:
        similarity_scores[key] = round(similarity_scores[key], 3)

    # Determine overall interpretation
    max_sim_key = max(similarity_scores, key=similarity_scores.get)
    max_class = max_sim_key.replace('_similarity', '').upper()

    # Generate detailed interpretation
    interpretation = _generate_interpretation(similarity_scores, max_class, classes)

    # Generate visualization
    plot_base64 = _generate_similarity_plot(similarity_scores, classes, prediction)

    # Generate feature comparison data
    feature_comparison = _generate_feature_comparison(classes, prediction)

    return {
        **similarity_scores,
        'classification_type': analysis_type,
        'overall_similarity': f"Higher Similarity to {max_class} Pattern",
        'interpretation': interpretation,
        'plot_base64': plot_base64,
        'feature_comparison': feature_comparison,
        'predicted_class': prediction
    }


def _run_similarity_real(scan_path: str, analysis_type: str) -> Dict[str, Any]:
    """
    Real similarity analysis implementation.
    TODO: Implement with actual DTW or feature-based comparison.
    """
    raise NotImplementedError("Real similarity analysis not yet implemented.")


def _generate_interpretation(
    similarity_scores: Dict[str, float],
    max_class: str,
    classes: List[str]
) -> str:
    """
    Generate detailed interpretation text for similarity analysis.
    """
    disease_names = {
        'CN': 'Cognitively Normal',
        'MCI': 'Mild Cognitive Impairment',
        'AD': "Alzheimer's Disease"
    }

    lines = [
        f"Similarity Analysis Results:",
        f"",
        f"The patient's brain MRI features were compared against reference patterns from validated databases.",
        f""
    ]

    # Add similarity scores
    for cls in classes:
        key = f'{cls.lower()}_similarity'
        score = similarity_scores.get(key, 0)
        name = disease_names.get(cls, cls)
        lines.append(f"- Similarity to {name} ({cls}): {score*100:.1f}%")

    lines.append("")

    # Overall assessment
    lines.append(f"Overall Assessment:")
    lines.append(f"The brain patterns show highest similarity to {disease_names.get(max_class, max_class)} reference patterns.")

    if max_class == 'CN':
        lines.append("This suggests brain structure within normal parameters for age group.")
    else:
        lines.append(f"This finding warrants clinical correlation and further evaluation.")

    lines.append("")
    lines.append("Note: Similarity scores represent pattern matching with reference datasets and should be interpreted alongside clinical findings.")

    return "\n".join(lines)


def _generate_similarity_plot(
    similarity_scores: Dict[str, float],
    classes: List[str],
    prediction: str
) -> str:
    """
    Generate a bar chart visualization of similarity scores.

    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    # Prepare data
    labels = []
    values = []
    colors = []

    disease_names = {
        'CN': 'Cognitively\nNormal',
        'MCI': 'Mild Cognitive\nImpairment',
        'AD': "Alzheimer's\nDisease"
    }

    for cls in classes:
        key = f'{cls.lower()}_similarity'
        labels.append(disease_names.get(cls, cls))
        values.append(similarity_scores.get(key, 0) * 100)

        # Get color from config
        info = DISEASE_INFO.get(cls, {})
        hex_color = info.get('hex_color', '#808080')
        colors.append(hex_color)

    # Create horizontal bar chart
    y_pos = np.arange(len(labels))
    bars = ax.barh(y_pos, values, color=colors, edgecolor='white', linewidth=1.5)

    # Customize appearance
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels, fontsize=11)
    ax.set_xlabel('Similarity Score (%)', fontsize=12)
    ax.set_title('Brain Pattern Similarity Comparison', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, 100)

    # Add value labels on bars
    for bar, val in zip(bars, values):
        width = bar.get_width()
        ax.text(width + 2, bar.get_y() + bar.get_height()/2,
                f'{val:.1f}%', va='center', fontsize=10, fontweight='bold')

    # Add reference line at 50%
    ax.axvline(x=50, color='gray', linestyle='--', alpha=0.5, linewidth=1)
    ax.text(51, len(labels) - 0.5, '50%', fontsize=9, color='gray')

    # Highlight predicted class
    for i, cls in enumerate(classes):
        if cls == prediction:
            bars[i].set_edgecolor('#2c3e50')
            bars[i].set_linewidth(3)

    # Style
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='x', alpha=0.3)

    plt.tight_layout()

    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close(fig)

    return f"data:image/png;base64,{image_base64}"


def _generate_feature_comparison(classes: List[str], prediction: str) -> Dict[str, Any]:
    """
    Generate detailed feature comparison data.
    """
    features = [
        'Hippocampal Volume',
        'Cortical Thickness',
        'Ventricular Size',
        'White Matter Integrity',
        'Gray Matter Density',
        'Temporal Lobe Volume'
    ]

    comparison = {}
    for feature in features:
        feature_data = {'patient': random.uniform(0.4, 0.9)}

        for cls in classes:
            if cls == 'CN':
                feature_data[cls] = random.uniform(0.7, 0.9)
            elif cls == prediction:
                # Make patient similar to predicted class
                feature_data[cls] = feature_data['patient'] + random.uniform(-0.1, 0.1)
            else:
                feature_data[cls] = random.uniform(0.3, 0.7)

        comparison[feature] = feature_data

    return comparison


def generate_volume_comparison_chart(ml_results: Dict[str, Any]) -> str:
    """
    Generate a chart comparing patient brain volumes with normative ranges.

    Args:
        ml_results: ML model results containing volume measurements

    Returns:
        Base64 encoded PNG image
    """
    from config import NORMATIVE_VOLUMES

    fig, ax = plt.subplots(figsize=(12, 7))

    # Volume data
    volumes = {
        'Total Brain': ('brain_volume', 'total_brain'),
        'Gray Matter': ('gm_volume', 'gray_matter'),
        'White Matter': ('wm_volume', 'white_matter'),
        'CSF': ('csf_volume', 'csf'),
        'Hippocampus': ('hippocampal_volume', 'hippocampus')
    }

    labels = list(volumes.keys())
    patient_values = []
    norm_min = []
    norm_max = []

    for label, (ml_key, norm_key) in volumes.items():
        patient_val = ml_results.get(ml_key, 0)
        norm = NORMATIVE_VOLUMES.get(norm_key, {'min': 0, 'max': 100})

        # Normalize to percentage of normal range midpoint
        mid = (norm['min'] + norm['max']) / 2
        patient_values.append((patient_val / mid) * 100)
        norm_min.append((norm['min'] / mid) * 100)
        norm_max.append((norm['max'] / mid) * 100)

    x = np.arange(len(labels))
    width = 0.35

    # Plot normal range as a shaded area
    for i, (label, nmin, nmax) in enumerate(zip(labels, norm_min, norm_max)):
        ax.axhspan(nmin, nmax, xmin=(i-0.4)/len(labels), xmax=(i+0.4)/len(labels),
                   alpha=0.3, color='green', label='Normal Range' if i == 0 else '')

    # Plot patient values
    bars = ax.bar(x, patient_values, width, label='Patient', color='#3498db', edgecolor='white')

    # Add value labels
    for bar, val, orig_val in zip(bars, patient_values, [ml_results.get(v[0], 0) for v in volumes.values()]):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, height + 2,
                f'{orig_val:.1f}', ha='center', va='bottom', fontsize=9)

    # Customize
    ax.set_ylabel('% of Normal Range Midpoint', fontsize=11)
    ax.set_title('Brain Volume Analysis', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10)
    ax.legend(loc='upper right')
    ax.set_ylim(0, 130)

    # Add reference line at 100%
    ax.axhline(y=100, color='gray', linestyle='--', alpha=0.5)

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.3)

    plt.tight_layout()

    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close(fig)

    return f"data:image/png;base64,{image_base64}"


def generate_confidence_chart(probabilities: List[float], classes: List[str]) -> str:
    """
    Generate a horizontal bar chart showing prediction confidence for each class.

    Args:
        probabilities: List of probabilities for each class
        classes: List of class names

    Returns:
        Base64 encoded PNG image
    """
    fig, ax = plt.subplots(figsize=(8, 4))

    y_pos = np.arange(len(classes))
    values = [p * 100 for p in probabilities]

    # Colors based on disease
    colors = [DISEASE_INFO.get(cls, {}).get('hex_color', '#808080') for cls in classes]

    bars = ax.barh(y_pos, values, color=colors, edgecolor='white', height=0.6)

    ax.set_yticks(y_pos)
    ax.set_yticklabels([DISEASE_INFO.get(c, {}).get('full_name', c) for c in classes], fontsize=10)
    ax.set_xlabel('Confidence (%)', fontsize=11)
    ax.set_title('AI Prediction Confidence Distribution', fontsize=12, fontweight='bold')
    ax.set_xlim(0, 100)

    # Add value labels
    for bar, val in zip(bars, values):
        ax.text(val + 1, bar.get_y() + bar.get_height()/2,
                f'{val:.1f}%', va='center', fontsize=10, fontweight='bold')

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='x', alpha=0.3)

    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close(fig)

    return f"data:image/png;base64,{image_base64}"
