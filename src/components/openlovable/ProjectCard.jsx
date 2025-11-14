import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectCard({ project }) {
  const statusColors = {
    pending: 'bg-gray-500',
    crawling: 'bg-blue-500',
    generating: 'bg-purple-500',
    deploying: 'bg-yellow-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white mb-2">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Globe className="w-4 h-4" />
              <a 
                href={project.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 truncate max-w-xs"
              >
                {project.source_url}
              </a>
            </div>
          </div>
          <Badge className={`${statusColors[project.status]} text-white`}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Framework</div>
              <div className="text-white font-medium capitalize">{project.framework}</div>
            </div>
            <div>
              <div className="text-gray-400">Styling</div>
              <div className="text-white font-medium capitalize">{project.styling}</div>
            </div>
            {project.pages_crawled && (
              <div>
                <div className="text-gray-400">Pages Crawled</div>
                <div className="text-white font-medium">{project.pages_crawled}</div>
              </div>
            )}
            {project.files_generated && (
              <div>
                <div className="text-gray-400">Files Generated</div>
                <div className="text-white font-medium">{project.files_generated}</div>
              </div>
            )}
          </div>

          {project.deployment_url && (
            <Button
              variant="outline"
              className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
              onClick={() => window.open(project.deployment_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Deployment
            </Button>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {format(new Date(project.created_date), 'MMM d, yyyy HH:mm')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}