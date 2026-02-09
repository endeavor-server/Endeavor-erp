import { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  MessageSquare,
  Mail,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { db } from '../../lib/supabase';

const CONTENT_TYPES = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'pitch', label: 'Pitch', icon: Lightbulb },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'casual', label: 'Casual' },
];

export default function AIAssistant() {
  const [contentType, setContentType] = useState('email');
  const [tone, setTone] = useState('professional');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateContent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Simulate AI generation with mock content
    setTimeout(() => {
      const mockContent = generateMockContent(contentType, tone, prompt);
      setGeneratedContent(mockContent);
      setLoading(false);
      
      // Save to database
      db.aiContent.create({
        content_type: contentType,
        prompt,
        generated_content: mockContent,
        tone,
      });
    }, 1500);
  }

  function generateMockContent(type: string, tone: string, prompt: string): string {
    if (type === 'email') {
      return `Subject: Following up on ${prompt}

Dear Sir/Madam,

I hope this email finds you well. I wanted to follow up regarding ${prompt}.

At Endeavor Academy, we specialize in creating world-class e-learning solutions that can help transform your training programs. Our team of 900+ professionals includes instructional designers, content developers, and technology experts.

Key benefits of partnering with us:
• Custom e-learning development tailored to your needs
• Interactive and engaging content
• Quick turnaround times
• Cost-effective solutions

Would you be available for a quick call next week to discuss how we can support your goals?

Looking forward to hearing from you.

Best regards,
Team Endeavor Academy
https://www.endeavoracademy.us`;
    } else if (type === 'whatsapp') {
      return `Hi there! 👋

This is from Endeavor Academy. I noticed you might be interested in ${prompt}.

We can help you create amazing e-learning experiences! 

Would you like to know more? Just reply to this message.

Thanks!`;
    } else {
      return `PITCH: E-Learning Solutions for ${prompt}

PROBLEM:
Traditional training methods are expensive, time-consuming, and often ineffective.

SOLUTION:
Endeavor Academy provides customized e-learning solutions that:
• Reduce training costs by 60%
• Increase knowledge retention by 40%
• Scale to unlimited learners
• Deliver consistent quality

WHY US:
• 900+ skilled professionals
• 600+ freelancers for rapid scaling
• 10+ years of experience
• Fortune 500 clients

NEXT STEPS:
Let's schedule a demo to show you what's possible.`;
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary-700" />
          AI Assistant
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Generate personalized emails, WhatsApp messages, and pitches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Content</h2>
          
          <form onSubmit={generateContent} className="space-y-4">
            {/* Content Type */}
            <div>
              <label className="label">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setContentType(ct.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                      contentType === ct.value
                        ? 'border-primary-700 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <ct.icon className="h-4 w-4" />
                    <span className="text-sm">{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="label">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="input"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt */}
            <div>
              <label className="label">What do you want to write about?</label>
              <textarea
                required
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`E.g., "Follow up with Acme Corp about their e-learning project proposal" or "Introduce our LMS services to a new lead"`}
                className="input"
              />
            </div>

            {/* Template Quick Select */}
            <div>
              <label className="label text-xs text-gray-500">Quick Templates:</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  'Follow up on proposal',
                  'Introduction email',
                  'Meeting request',
                  'Price quote',
                  'Project update',
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPrompt(t)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Content</h2>
            {generatedContent && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {generatedContent ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {generatedContent}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <Sparkles className="h-12 w-12 mb-2 opacity-50" />
              <p>Generated content will appear here</p>
              <p className="text-sm">Fill in the details and click Generate</p>
            </div>
          )}

          {generatedContent && (
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send via WhatsApp
              </button>
              <button className="btn-secondary flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
