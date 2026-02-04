"""
NIfTI Slicer for MRI Platform
Extracts middle axial slices from NIfTI brain volumes for model input.
Also supports extracting slices for web viewer with Supabase upload.
"""

import os
import io
import numpy as np
from pathlib import Path
from typing import List, Optional, Dict
import logging

logger = logging.getLogger(__name__)

# Orientation axis mapping
ORIENTATION_AXIS = {
    'axial': 2,      # z-axis (top-down view)
    'sagittal': 0,   # x-axis (side view)
    'coronal': 1     # y-axis (front view)
}


class NIfTISlicer:
    """
    Extract middle slices from 3D NIfTI brain images and convert to 2D images.
    Works with both raw NIfTI files and CAT12-preprocessed mwp1 files.
    """

    def __init__(self, output_format: str = 'png', normalize: bool = True):
        """
        Initialize the slicer.

        Args:
            output_format: Output image format ('png', 'jpg', 'npy')
            normalize: Whether to normalize intensity values
        """
        self.output_format = output_format.lower()
        self.normalize = normalize

        if self.output_format not in ['png', 'jpg', 'jpeg', 'npy']:
            raise ValueError(f"Unsupported output format: {output_format}")

    def extract_middle_slices(
        self,
        nifti_path: str,
        num_slices: int = 5,
        axis: int = 2,  # 2 = axial (z-axis)
        output_dir: Optional[str] = None,
        prefix: str = 'slice'
    ) -> List[str]:
        """
        Extract middle slices from NIfTI file.

        Args:
            nifti_path: Path to input NIfTI file
            num_slices: Number of middle slices to extract (default: 5)
            axis: Axis along which to slice (0=sagittal, 1=coronal, 2=axial)
            output_dir: Directory to save slices
            prefix: Prefix for output filenames

        Returns:
            List of paths to saved slice images
        """
        try:
            import nibabel as nib
            from PIL import Image
        except ImportError:
            raise ImportError(
                "nibabel and Pillow are required for NIfTI processing. "
                "Install them with: pip install nibabel Pillow"
            )

        logger.info(f"Loading NIfTI file: {nifti_path}")

        # Load NIfTI file
        nifti_img = nib.load(nifti_path)
        data = nifti_img.get_fdata()

        logger.info(f"NIfTI shape: {data.shape}, range: [{data.min():.4f}, {data.max():.4f}]")

        # Validate dimensions
        if len(data.shape) != 3:
            raise ValueError(f"Expected 3D NIfTI, got shape {data.shape}")

        # Determine output directory
        if output_dir is None:
            output_dir = str(Path(nifti_path).parent / 'slices')

        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # Calculate middle slice indices
        total_slices = data.shape[axis]
        middle_idx = total_slices // 2

        # Get evenly spaced indices around the middle
        half_num = num_slices // 2
        start_idx = max(0, middle_idx - half_num)
        end_idx = min(total_slices, middle_idx + half_num + 1)

        slice_indices = list(range(start_idx, end_idx))
        logger.info(f"Extracting slices at indices: {slice_indices}")

        # Extract and save slices
        saved_paths = []

        for i, slice_idx in enumerate(slice_indices, 1):
            # Extract slice based on axis
            if axis == 0:  # Sagittal
                slice_data = data[slice_idx, :, :]
            elif axis == 1:  # Coronal
                slice_data = data[:, slice_idx, :]
            else:  # Axial (default)
                slice_data = data[:, :, slice_idx]

            # Rotate for correct orientation
            slice_data = np.rot90(slice_data)

            # Normalize if requested
            if self.normalize:
                slice_data = self._normalize_slice(slice_data)

            # Save slice
            output_filename = f"{prefix}_{i}.{self.output_format}"
            output_filepath = output_path / output_filename

            self._save_slice(slice_data, str(output_filepath))
            saved_paths.append(str(output_filepath))

            logger.info(f"Saved slice {i}/{len(slice_indices)}: {output_filepath}")

        logger.info(f"Extracted {len(saved_paths)} slices to {output_dir}")
        return saved_paths

    def _normalize_slice(self, slice_data: np.ndarray) -> np.ndarray:
        """Normalize slice data to 0-255 range."""
        if slice_data.max() == slice_data.min():
            return np.zeros_like(slice_data, dtype=np.uint8)

        # Percentile clipping to handle outliers
        p_low, p_high = np.percentile(slice_data, [1, 99])
        slice_data = np.clip(slice_data, p_low, p_high)

        # Normalize to 0-255
        slice_min = slice_data.min()
        slice_max = slice_data.max()
        normalized = ((slice_data - slice_min) / (slice_max - slice_min) * 255)

        return normalized.astype(np.uint8)

    def _save_slice(self, slice_data: np.ndarray, output_path: str):
        """Save slice to file."""
        if self.output_format == 'npy':
            np.save(output_path, slice_data)
        else:
            from PIL import Image

            if slice_data.dtype != np.uint8:
                slice_data = self._normalize_slice(slice_data)

            # Convert to RGB for model compatibility
            img = Image.fromarray(slice_data, mode='L')
            img = img.convert('RGB')

            if self.output_format in ['jpg', 'jpeg']:
                img.save(output_path, quality=95)
            else:
                img.save(output_path)


def quick_slice(nifti_path: str, num_slices: int = 5, output_dir: str = None) -> List[str]:
    """Quick utility function to extract slices from a NIfTI file."""
    slicer = NIfTISlicer(output_format='png', normalize=True)
    return slicer.extract_middle_slices(nifti_path, num_slices, output_dir=output_dir)


def extract_and_upload_viewer_slices(
    nifti_path: str,
    session_code: str,
    supabase_client,
    num_slices: int = 20,
    orientations: List[str] = None
) -> Dict[str, List[str]]:
    """
    Extract slices from NIfTI file for all orientations and upload to Supabase storage.

    Args:
        nifti_path: Path to the NIfTI file
        session_code: Session code for organizing storage
        supabase_client: Supabase client instance
        num_slices: Number of slices per orientation (default 20)
        orientations: List of orientations to extract ['axial', 'sagittal', 'coronal']

    Returns:
        Dictionary mapping orientation -> list of public URLs
        Example: {'axial': ['url1', 'url2', ...], 'sagittal': [...], 'coronal': [...]}
    """
    if orientations is None:
        orientations = ['axial', 'sagittal', 'coronal']

    try:
        import nibabel as nib
        from PIL import Image
    except ImportError:
        logger.error("nibabel and Pillow required for slice extraction")
        return {}

    logger.info(f"Extracting viewer slices from {nifti_path} for session {session_code}")

    # Load NIfTI file
    try:
        nifti_img = nib.load(nifti_path)
        data = nifti_img.get_fdata()
    except Exception as e:
        logger.error(f"Failed to load NIfTI file: {e}")
        return {}

    if len(data.shape) != 3:
        logger.error(f"Expected 3D NIfTI, got shape {data.shape}")
        return {}

    logger.info(f"NIfTI shape: {data.shape}, range: [{data.min():.2f}, {data.max():.2f}]")

    slice_urls = {}
    bucket_name = 'mri-scans'

    # First, verify the bucket exists and we can access it
    try:
        # Try to list files in the bucket to verify access
        logger.info(f"Verifying access to bucket: {bucket_name}")
        bucket_check = supabase_client.storage.from_(bucket_name).list()
        logger.info(f"Bucket '{bucket_name}' is accessible")
    except Exception as bucket_err:
        logger.error(f"ERROR: Cannot access bucket '{bucket_name}': {bucket_err}")
        logger.error("Make sure you've run database/12-complete-setup.sql in Supabase SQL Editor!")
        logger.error("This creates the required storage buckets.")
        return {}

    for orientation in orientations:
        axis = ORIENTATION_AXIS.get(orientation)
        if axis is None:
            logger.warning(f"Unknown orientation: {orientation}")
            continue

        logger.info(f"Processing {orientation} slices (axis {axis})")

        # Get total slices for this axis
        total_slices = data.shape[axis]

        # Calculate evenly distributed slice indices
        # Skip the first and last 10% to avoid edge slices
        margin = int(total_slices * 0.1)
        start_idx = margin
        end_idx = total_slices - margin

        if num_slices >= (end_idx - start_idx):
            indices = list(range(start_idx, end_idx))
        else:
            indices = np.linspace(start_idx, end_idx - 1, num_slices, dtype=int).tolist()

        orientation_urls = []

        for i, slice_idx in enumerate(indices):
            try:
                # Extract slice
                if axis == 0:  # Sagittal
                    slice_data = data[slice_idx, :, :]
                elif axis == 1:  # Coronal
                    slice_data = data[:, slice_idx, :]
                else:  # Axial
                    slice_data = data[:, :, slice_idx]

                # Rotate for correct orientation
                slice_data = np.rot90(slice_data)

                # Normalize with brain windowing
                slice_data = _normalize_for_viewing(slice_data)

                # Convert to PIL Image
                img = Image.fromarray(slice_data, mode='L')

                # Save to bytes buffer
                buffer = io.BytesIO()
                img.save(buffer, format='PNG', optimize=True)
                buffer.seek(0)

                # Upload to Supabase
                storage_path = f"slices/{session_code}/{orientation}/slice_{i:03d}.png"

                try:
                    # Try to upload (upsert if exists)
                    logger.info(f"Uploading slice to: {storage_path}")
                    result = supabase_client.storage.from_(bucket_name).upload(
                        storage_path,
                        buffer.getvalue(),
                        file_options={"content-type": "image/png", "upsert": "true"}
                    )
                    logger.info(f"Upload result: {result}")

                    # Get public URL
                    public_url = supabase_client.storage.from_(bucket_name).get_public_url(storage_path)
                    orientation_urls.append(public_url)
                    logger.info(f"Slice uploaded successfully: {public_url}")

                except Exception as upload_err:
                    logger.error(f"UPLOAD ERROR for {storage_path}: {upload_err}")
                    logger.error(f"Error type: {type(upload_err).__name__}")
                    # Try to get existing URL if upload failed (maybe it already exists)
                    try:
                        public_url = supabase_client.storage.from_(bucket_name).get_public_url(storage_path)
                        orientation_urls.append(public_url)
                        logger.info(f"Using existing URL: {public_url}")
                    except Exception as url_err:
                        logger.error(f"Failed to get public URL: {url_err}")

            except Exception as e:
                logger.warning(f"Error processing {orientation} slice {slice_idx}: {e}")
                continue

        slice_urls[orientation] = orientation_urls
        logger.info(f"Uploaded {len(orientation_urls)} {orientation} slices")

    logger.info(f"Total slices uploaded: {sum(len(urls) for urls in slice_urls.values())}")
    return slice_urls


def _normalize_for_viewing(slice_data: np.ndarray) -> np.ndarray:
    """
    Normalize slice data with brain-appropriate windowing.
    Uses percentile-based clipping for robust normalization.

    Args:
        slice_data: 2D numpy array of slice intensities

    Returns:
        Normalized uint8 array (0-255)
    """
    if slice_data.max() == slice_data.min():
        return np.zeros_like(slice_data, dtype=np.uint8)

    # Use percentile clipping for better contrast
    # This handles outliers and enhances brain tissue visibility
    p_low, p_high = np.percentile(slice_data[slice_data > 0], [2, 98])

    # Clip values
    clipped = np.clip(slice_data, p_low, p_high)

    # Normalize to 0-255
    normalized = ((clipped - p_low) / (p_high - p_low) * 255)

    return normalized.astype(np.uint8)


def extract_slices_to_memory(
    nifti_path: str,
    num_slices: int = 20,
    orientations: List[str] = None
) -> Dict[str, List[bytes]]:
    """
    Extract slices from NIfTI and return as in-memory PNG bytes.
    Useful for testing or when direct storage upload isn't needed.

    Args:
        nifti_path: Path to NIfTI file
        num_slices: Number of slices per orientation
        orientations: List of orientations to extract

    Returns:
        Dictionary mapping orientation -> list of PNG bytes
    """
    if orientations is None:
        orientations = ['axial', 'sagittal', 'coronal']

    try:
        import nibabel as nib
        from PIL import Image
    except ImportError:
        logger.error("nibabel and Pillow required")
        return {}

    # Load NIfTI
    nifti_img = nib.load(nifti_path)
    data = nifti_img.get_fdata()

    if len(data.shape) != 3:
        raise ValueError(f"Expected 3D NIfTI, got {data.shape}")

    slice_bytes = {}

    for orientation in orientations:
        axis = ORIENTATION_AXIS.get(orientation)
        if axis is None:
            continue

        total_slices = data.shape[axis]
        margin = int(total_slices * 0.1)
        start_idx = margin
        end_idx = total_slices - margin

        if num_slices >= (end_idx - start_idx):
            indices = list(range(start_idx, end_idx))
        else:
            indices = np.linspace(start_idx, end_idx - 1, num_slices, dtype=int).tolist()

        orientation_bytes = []

        for slice_idx in indices:
            if axis == 0:
                slice_data = data[slice_idx, :, :]
            elif axis == 1:
                slice_data = data[:, slice_idx, :]
            else:
                slice_data = data[:, :, slice_idx]

            slice_data = np.rot90(slice_data)
            slice_data = _normalize_for_viewing(slice_data)

            img = Image.fromarray(slice_data, mode='L')
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            orientation_bytes.append(buffer.getvalue())

        slice_bytes[orientation] = orientation_bytes

    return slice_bytes
