import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Code, Palette, Rocket } from 'lucide-react';

export default function CloneWebsiteForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    framework: 'react',
    styling: 'tailwind',
    deploy: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-400" />
          Clone Website
        </CardTitle>
        <CardDescription className="text-gray-400">
          Clone any website with AI-powered code generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-gray-200">
              Website URL *
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              disabled={isLoading}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Project Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="my-cloned-site"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="framework" className="text-gray-200 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Framework
              </Label>
              <Select
                value={formData.framework}
                onValueChange={(value) => setFormData({ ...formData, framework: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="styling" className="text-gray-200 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Styling
              </Label>
              <Select
                value={formData.styling}
                onValueChange={(value) => setFormData({ ...formData, styling: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                  <SelectItem value="css">Plain CSS</SelectItem>
                  <SelectItem value="styled-components">Styled Components</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deploy"
              checked={formData.deploy}
              onChange={(e) => setFormData({ ...formData, deploy: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500"
            />
            <Label htmlFor="deploy" className="text-gray-200 flex items-center gap-2 cursor-pointer">
              <Rocket className="w-4 h-4" />
              Deploy to Vercel after generation
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.url || !formData.name}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 text-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Cloning Website...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 mr-2" />
                Clone Website
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}