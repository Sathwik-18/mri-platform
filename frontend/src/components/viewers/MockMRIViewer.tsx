'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Ruler,
  Square,
  Circle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface MockMRIViewerProps {
  sessionId: string;
  viewerMode: 'patient' | 'doctor' | 'radiologist';
  prediction?: 'CN' | 'AD' | 'PD' | 'FTD';
  showAnnotations?: boolean;
}

export const MockMRIViewer: React.FC<MockMRIViewerProps> = ({
  sessionId,
  viewerMode,
  prediction,
  showAnnotations = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSlice, setCurrentSlice] = useState(60);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activeTool, setActiveTool] = useState<string>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const totalSlices = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw mock brain MRI
    drawBrainSlice(ctx, currentSlice, brightness, contrast, prediction);
  }, [currentSlice, brightness, contrast, prediction]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlice((prev) => (prev >= totalSlices ? 1 : prev + 1));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const drawBrainSlice = (
    ctx: CanvasRenderingContext2D,
    slice: number,
    brightness: number,
    contrast: number,
    prediction?: string
  ) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Calculate brain size based on slice (middle slices are larger)
    const maxSize = Math.min(width, height) * 0.7;
    const sliceRatio = 1 - Math.abs(slice - totalSlices / 2) / (totalSlices / 2);
    const size = maxSize * (0.3 + sliceRatio * 0.7);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);

    // Draw brain outline (ellipse)
    ctx.beginPath();
    ctx.ellipse(0, 0, size / 2, size / 1.8, 0, 0, Math.PI * 2);

    // Create gradient for brain tissue
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    const grayValue = Math.floor(120 * (brightness / 100) * (contrast / 100));
    gradient.addColorStop(0, `rgb(${grayValue + 40}, ${grayValue + 40}, ${grayValue + 40})`);
    gradient.addColorStop(0.5, `rgb(${grayValue}, ${grayValue}, ${grayValue})`);
    gradient.addColorStop(1, `rgb(${grayValue - 30}, ${grayValue - 30}, ${grayValue - 30})`);

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = `rgb(${grayValue + 60}, ${grayValue + 60}, ${grayValue + 60})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ventricles (dark regions)
    ctx.fillStyle = `rgb(${grayValue - 50}, ${grayValue - 50}, ${grayValue - 50})`;
    ctx.beginPath();
    ctx.ellipse(-size / 8, 0, size / 12, size / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size / 8, 0, size / 12, size / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw cortical regions
    ctx.strokeStyle = `rgb(${grayValue + 40}, ${grayValue + 40}, ${grayValue + 40})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-size / 4, -size / 4, size / 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 4, -size / 4, size / 8, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight regions based on prediction
    if (showAnnotations && prediction && prediction !== 'CN') {
      ctx.strokeStyle = prediction === 'AD' ? '#ef4444' : prediction === 'PD' ? '#f59e0b' : '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);

      if (prediction === 'AD') {
        // Highlight hippocampus region
        ctx.beginPath();
        ctx.arc(-size / 6, size / 6, size / 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(size / 6, size / 6, size / 10, 0, Math.PI * 2);
        ctx.stroke();
      } else if (prediction === 'PD') {
        // Highlight substantia nigra
        ctx.beginPath();
        ctx.arc(0, size / 8, size / 12, 0, Math.PI * 2);
        ctx.stroke();
      } else if (prediction === 'FTD') {
        // Highlight frontal lobe
        ctx.beginPath();
        ctx.arc(0, -size / 3, size / 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    ctx.restore();

    // Draw slice info
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`Slice: ${slice}/${totalSlices}`, 10, 25);
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, 10, 45);

    if (prediction) {
      const predictionColor = {
        CN: '#10b981',
        AD: '#ef4444',
        PD: '#f59e0b',
        FTD: '#8b5cf6',
      }[prediction];
      ctx.fillStyle = predictionColor;
      ctx.fillText(`Prediction: ${prediction}`, 10, 65);
    }
  };

  const tools = {
    patient: [],
    doctor: [
      { icon: ZoomIn, label: 'Zoom In', action: () => setZoom((z) => Math.min(z + 0.2, 3)) },
      { icon: ZoomOut, label: 'Zoom Out', action: () => setZoom((z) => Math.max(z - 0.2, 0.5)) },
      { icon: Move, label: 'Pan', action: () => setActiveTool('pan') },
    ],
    radiologist: [
      { icon: ZoomIn, label: 'Zoom In', action: () => setZoom((z) => Math.min(z + 0.2, 3)) },
      { icon: ZoomOut, label: 'Zoom Out', action: () => setZoom((z) => Math.max(z - 0.2, 0.5)) },
      { icon: Move, label: 'Pan', action: () => setActiveTool('pan') },
      { icon: RotateCw, label: 'Rotate', action: () => setActiveTool('rotate') },
      { icon: Ruler, label: 'Measure', action: () => setActiveTool('measure') },
      { icon: Square, label: 'ROI', action: () => setActiveTool('roi') },
      { icon: Circle, label: 'Ellipse', action: () => setActiveTool('ellipse') },
    ],
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {viewerMode !== 'patient' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium mr-4">Tools:</span>
              {tools[viewerMode].map((tool, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={activeTool === tool.label.toLowerCase() ? 'default' : 'outline'}
                  onClick={tool.action}
                >
                  <tool.icon className="h-4 w-4 mr-1" />
                  {tool.label}
                </Button>
              ))}

              {viewerMode === 'radiologist' && (
                <>
                  <div className="h-6 w-px bg-border mx-2" />
                  <span className="text-sm font-medium">Window/Level:</span>
                  <Button size="sm" variant="outline">Brain</Button>
                  <Button size="sm" variant="outline">Bone</Button>
                  <Button size="sm" variant="outline">Soft Tissue</Button>
                </>
              )}
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
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full h-auto"
              />

              {showAnnotations && prediction && prediction !== 'CN' && (
                <div className="absolute top-4 right-4">
                  <Badge
                    className={`text-lg ${
                      prediction === 'AD'
                        ? 'bg-red-500'
                        : prediction === 'PD'
                        ? 'bg-orange-500'
                        : 'bg-purple-500'
                    }`}
                  >
                    {prediction} Detected
                  </Badge>
                </div>
              )}
            </div>

            {/* Slice Controls */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSlice((s) => Math.max(1, s - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Slider
                  value={[currentSlice]}
                  onValueChange={([val]) => setCurrentSlice(val)}
                  min={1}
                  max={totalSlices}
                  step={1}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSlice((s) => Math.min(totalSlices, s + 1))}
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
                  <span className="font-medium">{sessionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sequence:</span>
                  <span>T1-weighted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Field Strength:</span>
                  <span>3T</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Slices:</span>
                  <span>{totalSlices}</span>
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
                      >
                        {prediction}
                      </Badge>
                    </div>
                  </div>
                  {prediction !== 'CN' && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <p className="font-medium">Highlighted Regions:</p>
                      <p className="text-muted-foreground mt-1">
                        {prediction === 'AD' && 'Hippocampus (medial temporal lobe)'}
                        {prediction === 'PD' && 'Substantia nigra (midbrain)'}
                        {prediction === 'FTD' && 'Frontal lobe'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewerMode === 'radiologist' && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Technical Details</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matrix:</span>
                    <span>256x256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slice Thickness:</span>
                    <span>1.0 mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TR/TE:</span>
                    <span>2000/30 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voxel Size:</span>
                    <span>1x1x1 mm³</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
