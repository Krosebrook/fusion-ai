import { useState } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Project } from "@/entities/Project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, CheckCircle, Download, Copy } from "lucide-react";
import { toast } from "sonner";

export default function ContentStudioPage() {
  const [config, setConfig] = useState({
    subject: '',
    gradeLevel: 'High School',
    standard: 'Common Core',
    contentType: 'lesson',
    duration: '45 minutes',
    learningObjectives: ''
  });
  
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerate = async () => {
    if (!config.subject || !config.learningObjectives) {
      alert('Please provide subject and learning objectives');
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Generate comprehensive educational content:

Subject: ${config.subject}
Grade Level: ${config.gradeLevel}
Standard: ${config.standard}
Content Type: ${config.contentType}
Duration: ${config.duration}

Learning Objectives:
${config.learningObjectives}

Please provide:
1. Detailed ${config.contentType} plan
2. Learning activities and materials
3. Assessment strategies
4. Differentiation approaches
5. Standards alignment
6. Resources and references

Format the content professionally with clear sections.`;

      const response = await InvokeLLM({ prompt });
      
      const project = await Project.create({
        name: `${config.subject} - ${config.contentType}`,
        type: 'content',
        status: 'completed',
        configuration: config,
        output_data: { content: response }
      });

      setGenerated({
        id: project.id,
        content: response
      });
    } catch (error) {
      console.error("Error generating content:", error);
      alert('Error generating content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated.content);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              background: 'linear-gradient(135deg, #00B4D820, #00B4D810)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={28} style={{ color: '#00B4D8' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                Educational Content Studio
              </h1>
              <p style={{ fontSize: '16px', color: '#94A3B8' }}>
                Generate standards-aligned educational materials
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: generated ? '1fr 1fr' : '1fr',
          gap: '32px'
        }}>
          {/* Configuration Panel */}
          <div className="ff-card" style={{ padding: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '24px',
              color: '#FFFFFF'
            }}>
              Content Configuration
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#CBD5E1'
                }}>
                  Subject *
                </label>
                <Input
                  value={config.subject}
                  onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  placeholder="e.g., U.S. History, Algebra I, Biology"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Grade Level
                  </label>
                  <Select
                    value={config.gradeLevel}
                    onValueChange={(value) => setConfig({ ...config, gradeLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elementary">Elementary (K-5)</SelectItem>
                      <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
                      <SelectItem value="High School">High School (9-12)</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Standard
                  </label>
                  <Select
                    value={config.standard}
                    onValueChange={(value) => setConfig({ ...config, standard: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Common Core">Common Core</SelectItem>
                      <SelectItem value="NGSS">NGSS (Science)</SelectItem>
                      <SelectItem value="AP">Advanced Placement</SelectItem>
                      <SelectItem value="IB">International Baccalaureate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Content Type
                  </label>
                  <Select
                    value={config.contentType}
                    onValueChange={(value) => setConfig({ ...config, contentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson Plan</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#CBD5E1'
                  }}>
                    Duration
                  </label>
                  <Select
                    value={config.duration}
                    onValueChange={(value) => setConfig({ ...config, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="45 minutes">45 minutes</SelectItem>
                      <SelectItem value="60 minutes">60 minutes</SelectItem>
                      <SelectItem value="90 minutes">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#CBD5E1'
                }}>
                  Learning Objectives *
                </label>
                <Textarea
                  value={config.learningObjectives}
                  onChange={(e) => setConfig({ ...config, learningObjectives: e.target.value })}
                  placeholder="What should students be able to do after this lesson?"
                  rows={4}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="ff-btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: '#00B4D8'
                }}
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" style={{ marginRight: '8px' }} size={20} />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <BookOpen style={{ marginRight: '8px' }} size={20} />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          {generated && (
            <div className="ff-card" style={{ padding: '32px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={24} style={{ color: '#10B981' }} />
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FFFFFF'
                  }}>
                    Content Generated!
                  </h2>
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                maxHeight: '500px',
                overflowY: 'auto',
                marginBottom: '24px',
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#CBD5E1',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {generated.content}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  onClick={copyToClipboard}
                  className="ff-btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Copy size={18} style={{ marginRight: '8px' }} />
                  Copy
                </Button>
                <Button className="ff-btn-secondary" style={{ flex: 1 }}>
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Export
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}