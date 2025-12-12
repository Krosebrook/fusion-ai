import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/hooks/useAuth";
import { ProtectedRoute } from "@/components/ui-library/ProtectedRoute";
import ContentGenerator from "@/components/content-suite/ContentGenerator";
import ContentOptimizer from "@/components/content-suite/ContentOptimizer";
import { CinematicImageGenerator } from "@/components/content-suite/CinematicImageGenerator";
import { Sparkles, FileText, TrendingUp, Image } from "lucide-react";

export default function ContentStudioPage() {
  const { authorized, loading } = useAuth();

  if (loading) return null;
  if (!authorized) return <ProtectedRoute />;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }} className="ff-fade-in">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255, 123, 0, 0.3)'
            }}>
              <Sparkles size={28} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #FF7B00, #E91E63)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AI Content Suite
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Generate, optimize, and create stunning content with cinematic AI
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-8">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              Content Generation
            </TabsTrigger>
            <TabsTrigger 
              value="optimize"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Content Optimizer
            </TabsTrigger>
            <TabsTrigger 
              value="visuals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500"
            >
              <Image className="w-4 h-4 mr-2" />
              Visual Assets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <ContentGenerator />
          </TabsContent>

          <TabsContent value="optimize">
            <ContentOptimizer />
          </TabsContent>

          <TabsContent value="visuals">
            <CinematicImageGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}