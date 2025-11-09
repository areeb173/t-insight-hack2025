'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { WorkflowDiagrams } from '@/components/workflow/workflow-diagrams'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, BarChart3, Lightbulb, LineChart, CheckCircle2 } from 'lucide-react'

export default function PipelinePage() {
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      <Navbar userEmail={userEmail} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#E8258E] mb-4">Pipeline</h1>
          <p className="text-xl text-tmobile-gray-600 max-w-3xl mx-auto">
            A PM-first intelligence workflow that transforms customer signals into actionable opportunities
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#E8258E]/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-[#E8258E]" />
              </div>
              <h3 className="font-bold text-lg">1. Detect</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Automatically scrape customer signals from Reddit, DownDetector, community forums, and app reviews
            </p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#7C3E93]/10 rounded-lg">
                <LineChart className="h-6 w-6 text-[#7C3E93]" />
              </div>
              <h3 className="font-bold text-lg">2. Process</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Analyze sentiment, detect topics, deduplicate, and map to product areas (Network, App, Billing, Home Internet)
            </p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#00A19C]/10 rounded-lg">
                <Lightbulb className="h-6 w-6 text-[#00A19C]" />
              </div>
              <h3 className="font-bold text-lg">3. Prioritize</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Auto-create opportunities with RICE scoring, generate PRDs and user stories, and organize by severity
            </p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#F58220]/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#F58220]" />
              </div>
              <h3 className="font-bold text-lg">4. Validate</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Close-the-loop monitoring tracks sentiment recovery after deploying solutions and generates release notes
            </p>
          </Card>
        </div>

        {/* Interactive Diagrams */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-tmobile-black mb-6">Workflow Visualizations</h2>
          <WorkflowDiagrams />
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-tmobile-black mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">Customer Happiness Index (CHI)</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Real-time sentiment score (0-100) calculated from weighted signal analysis across all product areas.
              </p>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">RICE Prioritization</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Automatically calculate priority scores for every opportunity using the RICE framework: (Reach × Impact × Confidence) / Effort
              </p>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">AI-Powered Insights</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Generate PRDs, user stories, and release notes automatically from signal data using GenAI assistance.
              </p>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">Close-the-Loop Monitoring</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Automatically monitor sentiment recovery after marking opportunities as "Done" to validate that your solutions worked.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-[#E8258E]/10 via-white to-[#7C3E93]/10 backdrop-blur-sm border-2 border-[#E8258E]/30 shadow-2xl p-12">
            <h2 className="text-3xl font-bold text-[#E8258E] mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-tmobile-gray-700 mb-8 max-w-2xl mx-auto">
              Head to the Dashboard to see real-time customer signals, or explore the PM Workbench to start creating opportunities.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-[#E8258E] hover:bg-[#D01A7A] text-white px-8 py-6 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pm/opportunities">
                <Button
                  variant="outline"
                  className="border-2 border-[#E8258E] text-[#E8258E] hover:bg-[#E8258E]/10 px-8 py-6 text-lg"
                >
                  View Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}


