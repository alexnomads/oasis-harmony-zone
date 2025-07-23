
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key } from 'lucide-react';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSetupClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSupabaseSetup = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  const handleHuggingFaceSetup = () => {
    window.open('https://huggingface.co/settings/tokens', '_blank');
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border border-white/20 mb-4">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="w-5 h-5" />
          AI Coach Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription className="text-white/80">
            To enable the AI Coach, you need to configure your Hugging Face API key in Supabase.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSetupClick}
          className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange"
        >
          {isExpanded ? 'Hide Setup Instructions' : 'Show Setup Instructions'}
        </Button>

        {isExpanded && (
          <div className="space-y-4 text-white/80">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Step 1: Get Hugging Face API Key</h4>
              <p className="text-sm">
                You need a free Hugging Face API key to use the AI models.
              </p>
              <Button
                onClick={handleHuggingFaceSetup}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Get Hugging Face API Key
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Step 2: Add to Supabase</h4>
              <p className="text-sm">
                Add your API key to Supabase Edge Functions secrets:
              </p>
              <ol className="text-sm list-decimal list-inside space-y-1 ml-4">
                <li>Go to your Supabase Dashboard</li>
                <li>Navigate to Project Settings → Edge Functions</li>
                <li>Add a new secret: <code className="bg-white/10 px-1 rounded">HUGGING_FACE_API_KEY</code></li>
                <li>Paste your Hugging Face token as the value</li>
              </ol>
              <Button
                onClick={handleSupabaseSetup}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Supabase Dashboard
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Step 3: Test the Connection</h4>
              <p className="text-sm">
                Once configured, refresh this page and try sending a message to the AI Coach.
              </p>
              <Button
                onClick={onApiKeySet}
                className="bg-gradient-to-r from-vibrantPurple to-vibrantOrange"
              >
                I've Set Up My API Key
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
