import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PredictionCardProps {
  prediction: 'CN' | 'AD' | 'PD' | 'FTD';
  probabilities: {
    CN: number;
    AD: number;
    PD: number;
    FTD: number;
  };
  confidenceScore: number;
  className?: string;
}

const predictionConfig = {
  CN: {
    label: 'Cognitively Normal',
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'No signs of neurodegenerative disease detected',
  },
  AD: {
    label: "Alzheimer's Disease",
    color: 'bg-red-100 text-red-800 border-red-300',
    description: 'Patterns consistent with Alzheimer\'s disease',
  },
  PD: {
    label: "Parkinson's Disease",
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Patterns consistent with Parkinson\'s disease',
  },
  FTD: {
    label: 'Frontotemporal Dementia',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Patterns consistent with Frontotemporal Dementia',
  },
};

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  probabilities,
  confidenceScore,
  className = '',
}) => {
  const config = predictionConfig[prediction];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Prediction</span>
          <Badge className={config.color}>{config.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Confidence:</span>
            <Progress value={confidenceScore * 100} className="flex-1" />
            <span className="text-sm font-bold">{(confidenceScore * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Probability Distribution</h4>
          {Object.entries(probabilities).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs w-12 font-medium">{key}:</span>
              <Progress
                value={value * 100}
                className={`flex-1 ${key === prediction ? 'bg-primary' : ''}`}
              />
              <span className="text-xs w-12 text-right">{(value * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
