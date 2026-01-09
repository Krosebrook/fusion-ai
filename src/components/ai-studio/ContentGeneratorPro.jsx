/**
 * Content Generator Pro
 * Comprehensive content generation suite
 */

import { useState } from 'react';
import { generationService } from '../services/GenerationService';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { FileText, Hash, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ContentCard } from '../molecules/ContentCard';

export function ContentGeneratorPro() {
  const [contentType, setContentType] = useState('marketing');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  // Marketing Copy State
  const [marketingData, setMarketingData] = useState({
    product: '',
    benefits: '',
    cta: '',
    tone: 'professional',
    length: 'medium',
  });

  // Social Media State
  const [socialData, setSocialData] = useState({
    topic: '',
    platform: 'twitter',
    tone: 'casual',
    hashtags: 5,
    count: 3,
  });

  // Product Description State
  const [productData, setProductData] = useState({
    productName: '',
    features: '',
    targetAudience: '',
    seoKeywords: '',
  });

  const handleGenerateMarketing = async () => {
    try {
      setGenerating(true);
      const res = await generationService.generateMarketingCopy(marketingData);
      setResult(res);
      toast.success('Marketing copy generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSocial = async () => {
    try {
      setGenerating(true);
      const res = await generationService.generateSocialPosts(socialData);
      setResult({ posts: res });
      toast.success('Social posts generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateProduct = async () => {
    try {
      setGenerating(true);
      const res = await generationService.generateProductDescription(productData);
      setResult(res);
      toast.success('Product description generated');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <CinematicCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Content Generator</h2>

          <Tabs value={contentType} onValueChange={setContentType}>
            <TabsList className="bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="marketing">
                <MessageSquare className="w-4 h-4 mr-2" />
                Marketing
              </TabsTrigger>
              <TabsTrigger value="social">
                <Hash className="w-4 h-4 mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="product">
                <FileText className="w-4 h-4 mr-2" />
                Product
              </TabsTrigger>
            </TabsList>

            {/* Marketing Copy */}
            <TabsContent value="marketing" className="space-y-4">
              <CinematicInput
                label="Product/Service"
                placeholder="AI-powered analytics platform"
                value={marketingData.product}
                onChange={(e) => setMarketingData({ ...marketingData, product: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Benefits</label>
                <Textarea
                  placeholder="Real-time insights, automated reporting..."
                  value={marketingData.benefits}
                  onChange={(e) => setMarketingData({ ...marketingData, benefits: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <CinematicInput
                label="Call-to-Action"
                placeholder="Start your free trial"
                value={marketingData.cta}
                onChange={(e) => setMarketingData({ ...marketingData, cta: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
                  <Select value={marketingData.tone} onValueChange={(v) => setMarketingData({ ...marketingData, tone: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Length</label>
                  <Select value={marketingData.length} onValueChange={(v) => setMarketingData({ ...marketingData, length: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CinematicButton variant="primary" onClick={handleGenerateMarketing} loading={generating} glow className="w-full">
                Generate Marketing Copy
              </CinematicButton>
            </TabsContent>

            {/* Social Media */}
            <TabsContent value="social" className="space-y-4">
              <CinematicInput
                label="Topic"
                placeholder="Launch announcement for new product"
                value={socialData.topic}
                onChange={(e) => setSocialData({ ...socialData, topic: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                  <Select value={socialData.platform} onValueChange={(v) => setSocialData({ ...socialData, platform: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
                  <Select value={socialData.tone} onValueChange={(v) => setSocialData({ ...socialData, tone: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CinematicButton variant="primary" onClick={handleGenerateSocial} loading={generating} glow className="w-full">
                Generate Social Posts
              </CinematicButton>
            </TabsContent>

            {/* Product Description */}
            <TabsContent value="product" className="space-y-4">
              <CinematicInput
                label="Product Name"
                placeholder="FlashFusion Pro"
                value={productData.productName}
                onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Features</label>
                <Textarea
                  placeholder="AI generation, analytics, templates..."
                  value={productData.features}
                  onChange={(e) => setProductData({ ...productData, features: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <CinematicInput
                label="Target Audience"
                placeholder="Designers, marketers, developers"
                value={productData.targetAudience}
                onChange={(e) => setProductData({ ...productData, targetAudience: e.target.value })}
              />
              <CinematicInput
                label="SEO Keywords"
                placeholder="AI, automation, productivity"
                value={productData.seoKeywords}
                onChange={(e) => setProductData({ ...productData, seoKeywords: e.target.value })}
              />
              <CinematicButton variant="primary" onClick={handleGenerateProduct} loading={generating} glow className="w-full">
                Generate Product Description
              </CinematicButton>
            </TabsContent>
          </Tabs>
        </div>
      </CinematicCard>

      {/* Output Panel */}
      <div>
        {result ? (
          <div className="space-y-4">
            {result.headline && (
              <CinematicCard>
                <div className="p-6">
                  <CinematicBadge variant="primary" className="mb-4">Headline</CinematicBadge>
                  <h3 className="text-2xl font-bold text-white">{result.headline}</h3>
                </div>
              </CinematicCard>
            )}
            {result.body && (
              <ContentCard title="Body Copy" content={result.body} type="markdown" />
            )}
            {result.posts && result.posts.map((post, i) => (
              <ContentCard key={i} title={`Post ${i + 1}`} content={post.text} metadata={{ characterCount: post.characterCount }} />
            ))}
            {result.fullDescription && (
              <ContentCard title="Full Description" content={result.fullDescription} type="text" />
            )}
          </div>
        ) : (
          <CinematicCard className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">Generated content will appear here</p>
          </CinematicCard>
        )}
      </div>
    </div>
  );
}

export default ContentGeneratorPro;