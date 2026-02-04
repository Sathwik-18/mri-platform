'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface SliceUrls {
  axial: string[];
  sagittal: string[];
  coronal: string[];
}

interface RealMRIViewerProps {
  sessionId: string;
  sliceUrls: SliceUrls;
  viewerMode: 'patient' | 'doctor' | 'radiologist';
  prediction?: 'CN' | 'MCI' | 'AD';
  confidence?: number;
  showAnnotations?: boolean;
}

type Orientation = 'axial' | 'sagittal' | 'coronal';

const orientationLabels: Record<Orientation, string> = {
  axial: 'Axial (Top-Down)',
  sagittal: 'Sagittal (Side)',
  coronal: 'Coronal (Front)',
};

export const RealMRIViewer: React.FC<RealMRIViewerProps> = ({
  sessionId,
  sliceUrls,
  viewerMode,
  prediction,
  confidence,
  showAnnotations = true,
}) => {
  const [orientation, setOrientation] = useState<Orientation>('axial');
  const [currentSlice, setCurrentSlice] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get slices for current orientation
  const currentSlices = sliceUrls[orientation] || [];
  const totalSlices = currentSlices.length;
  const currentSliceUrl = currentSlices[currentSlice] || '';

  // Reset slice index when orientation changes
  useEffect(() => {
    setCurrentSlice(Math.floor((sliceUrls[orientation]?.length || 1) / 2));
    setImageLoaded(false);
    setImageError(false);
  }, [orientation, sliceUrls]);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || totalSlices === 0) return;

    const interval = setInterval(() => {
      setCurrentSlice((prev) => (prev >= totalSlices - 1 ? 0 : prev + 1));
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, totalSlices]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlice((s) => Math.max(0, s - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlice((s) => Math.min(totalSlices - 1, s + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlices]);

  const resetView = useCallback(() => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setCurrentSlice(Math.floor(totalSlices / 2));
  }, [totalSlices]);

  // CSS filter for brightness/contrast
  const imageFilter = `brightness(${brightness}%) contrast(${contrast}%)`;

  if (totalSlices === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No brain slices available for viewing.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Slices are generated when a scan is processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Orientation Tabs */}
      <Tabs value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="axial" disabled={!sliceUrls.axial?.length}>
            Axial
          </TabsTrigger>
          <TabsTrigger value="sagittal" disabled={!sliceUrls.sagittal?.length}>
            Sagittal
          </TabsTrigger>
          <TabsTrigger value="coronal" disabled={!sliceUrls.coronal?.length}>
            Coronal
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      {viewerMode !== 'patient' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium mr-4">Tools:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              >
                <ZoomIn className="h-4 w-4 mr-1" />
                Zoom In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              >
                <ZoomOut className="h-4 w-4 mr-1" />
                Zoom Out
              </Button>
              <Button size="sm" variant="outline" onClick={resetView}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main viewer */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              {/* Image container with zoom */}
              <div
                className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
                style={{ minHeight: '400px' }}
              >
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}

                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p>Failed to load image</p>
                  </div>
                )}

                <img
                  src={currentSliceUrl}
                  alt={`Brain ${orientation} slice ${currentSlice + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    filter: imageFilter,
                    transform: `scale(${zoom})`,
                    opacity: imageLoaded ? 1 : 0,
                  }}
                  onLoad={() => {
                    setImageLoaded(true);
                    setImageError(false);
                  }}
                  onError={() => {
                    setImageLoaded(false);
                    setImageError(true);
                  }}
                  draggable={false}
                />

                {/* Slice info overlay */}
                <div className="absolute top-2 left-2 text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                  <div>Slice: {currentSlice + 1}/{totalSlices}</div>
                  <div>View: {orientationLabels[orientation]}</div>
                  <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
                </div>

                {/* Prediction badge */}
                {showAnnotations && prediction && prediction !== 'CN' && (
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`text-sm ${
                        prediction === 'AD' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                    >
                      {prediction === 'AD' ? "Alzheimer's Disease" : 'Mild Cognitive Impairment'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Slice Controls */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSlice((s) => Math.max(0, s - 1))}
                  disabled={currentSlice === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Slider
                  value={[currentSlice]}
                  onValueChange={([val]) => setCurrentSlice(val)}
                  min={0}
                  max={Math.max(0, totalSlices - 1)}
                  step={1}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSlice((s) => Math.min(totalSlices - 1, s + 1))}
                  disabled={currentSlice === totalSlices - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={isPlaying ? 'default' : 'outline'}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>

              {viewerMode !== 'patient' && (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-24">Brightness:</span>
                    <Slider
                      value={[brightness]}
                      onValueChange={([val]) => setBrightness(val)}
                      min={50}
                      max={150}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{brightness}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-24">Contrast:</span>
                    <Slider
                      value={[contrast]}
                      onValueChange={([val]) => setContrast(val)}
                      min={50}
                      max={150}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{contrast}%</span>
                  </div>
                </>
              )}

              {/* Keyboard hints */}
              <p className="text-xs text-muted-foreground text-center">
                Use arrow keys to navigate slices, spacebar to play/pause
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Scan Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session:</span>
                  <span className="font-medium truncate ml-2">{sessionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">View:</span>
                  <span>{orientationLabels[orientation]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Slices:</span>
                  <span>{totalSlices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Slice:</span>
                  <span>{currentSlice + 1}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Available Views</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Axial:</span>
                  <span>{sliceUrls.axial?.length || 0} slices</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sagittal:</span>
                  <span>{sliceUrls.sagittal?.length || 0} slices</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coronal:</span>
                  <span>{sliceUrls.coronal?.length || 0} slices</span>
                </div>
              </div>
            </div>

            {showAnnotations && prediction && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">AI Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Primary Finding:</span>
                    <div className="mt-1">
                      <Badge
                        variant={prediction === 'CN' ? 'default' : 'destructive'}
                        className={
                          prediction === 'CN'
                            ? 'bg-green-100 text-green-800'
                            : prediction === 'MCI'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {prediction === 'CN' && 'Cognitively Normal'}
                        {prediction === 'MCI' && 'Mild Cognitive Impairment'}
                        {prediction === 'AD' && "Alzheimer's Disease"}
                      </Badge>
                    </div>
                  </div>
                  {confidence !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium">{(confidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {prediction !== 'CN' && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <p className="font-medium">Key Observations:</p>
                      <p className="text-muted-foreground mt-1">
                        {prediction === 'AD' &&
                          'Hippocampal atrophy, temporal lobe changes visible in axial and coronal views'}
                        {prediction === 'MCI' &&
                          'Early hippocampal changes, best visualized in coronal sections'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewerMode === 'radiologist' && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Viewing Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>- Use axial view for overall brain structure</li>
                  <li>- Sagittal view shows corpus callosum</li>
                  <li>- Coronal view best for hippocampal assessment</li>
                  <li>- Adjust brightness/contrast for better visualization</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealMRIViewer;
