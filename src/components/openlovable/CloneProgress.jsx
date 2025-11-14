import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export default function CloneProgress({ status, metadata }) {
  const steps = [
    { key: 'crawling', label: 'Crawling Website', detail: metadata?.pages_crawled ? `${metadata.pages_crawled} pages` : '' },
    { key: 'generating', label: 'Generating Code', detail: metadata?.files_generated ? `${metadata.files_generated} files` : '' },
    { key: 'deploying', label: 'Deploying', detail: metadata?.deployment_url ? 'To Vercel' : '' },
    { key: 'completed', label: 'Complete', detail: '' },
  ];

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-white">
          Clone Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex || status === 'completed';
            const isFailed = status === 'failed';

            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${
                    isComplete ? 'text-green-400' : 
                    isActive ? 'text-blue-400' : 
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  {step.detail && (
                    <div className="text-sm text-gray-400 mt-1">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {status === 'failed' && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 font-semibold">Clone Failed</p>
            {metadata?.error_message && (
              <p className="text-gray-300 text-sm mt-2">{metadata.error_message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}