'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Copy, Download, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReleaseNotesGeneratorProps {
  opportunityId: string
  opportunityTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated?: () => void
}

interface ReleaseNotes {
  customerFacing: string
  executiveSummary: string
  internalNotes: string
  suggestedTitle: string
  metadata: {
    chiImprovement: number | null
    sentimentRecovery: number
    affectedCustomers: number
    timeToRecover: string
    detectionDate: string
    fixDate: string
    recoveryDate: string
  }
}

export function ReleaseNotesGenerator({
  opportunityId,
  opportunityTitle,
  open,
  onOpenChange,
  onGenerated,
}: ReleaseNotesGeneratorProps) {
  const [format, setFormat] = useState<'all' | 'customer-facing' | 'executive' | 'internal'>('all')
  const [style, setStyle] = useState<'concise' | 'detailed' | 'narrative'>('detailed')
  const [generating, setGenerating] = useState(false)
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes | null>(null)
  const [activeTab, setActiveTab] = useState<'customer' | 'executive' | 'internal'>('customer')
  const [editedNotes, setEditedNotes] = useState<Partial<ReleaseNotes>>({})

  const handleGenerate = async () => {
    setGenerating(true)
    setReleaseNotes(null)
    setEditedNotes({})

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/release-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, style }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate release notes')
      }

      setReleaseNotes(data.releaseNotes)
      setEditedNotes(data.releaseNotes)
      toast.success('Release notes generated successfully!')
    } catch (error) {
      console.error('Error generating release notes:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate release notes')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Release notes downloaded!')
  }

  const handleSave = () => {
    if (onGenerated) {
      onGenerated()
    }
    toast.success('Release notes saved to opportunity!')
    onOpenChange(false)
  }

  const getCurrentText = () => {
    if (!releaseNotes) return ''
    switch (activeTab) {
      case 'customer':
        return editedNotes.customerFacing || releaseNotes.customerFacing
      case 'executive':
        return editedNotes.executiveSummary || releaseNotes.executiveSummary
      case 'internal':
        return editedNotes.internalNotes || releaseNotes.internalNotes
    }
  }

  const updateCurrentText = (text: string) => {
    switch (activeTab) {
      case 'customer':
        setEditedNotes({ ...editedNotes, customerFacing: text })
        break
      case 'executive':
        setEditedNotes({ ...editedNotes, executiveSummary: text })
        break
      case 'internal':
        setEditedNotes({ ...editedNotes, internalNotes: text })
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-tmobile-magenta" />
            Generate Release Notes
          </DialogTitle>
          <DialogDescription>
            Create professional release notes for: <strong>{opportunityTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {!releaseNotes ? (
          <div className="space-y-6 py-4">
            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as typeof format)}
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    <SelectItem value="all">All 3 Formats</SelectItem>
                    <SelectItem value="customer-facing">Customer-Facing Only</SelectItem>
                    <SelectItem value="executive">Executive Summary Only</SelectItem>
                    <SelectItem value="internal">Internal Notes Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select
                  value={style}
                  onValueChange={(v) => setStyle(v as typeof style)}
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[150]">
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                size="lg"
                className="bg-gradient-to-r from-tmobile-magenta to-tmobile-magenta-dark hover:from-tmobile-magenta-dark hover:to-tmobile-magenta"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing customer impact...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Release Notes
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-tmobile-gray-200 bg-tmobile-gray-50 p-4 text-sm text-tmobile-gray-700">
              <p className="font-medium mb-2">What will be generated:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li><strong>Customer-Facing:</strong> Empathetic, accessible language with customer quotes</li>
                <li><strong>Executive Summary:</strong> Business impact, metrics, and strategic value</li>
                <li><strong>Internal Notes:</strong> Technical details, root cause, and team guidance</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Metrics Summary */}
            {releaseNotes.metadata && (
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gradient-to-br from-tmobile-magenta/5 via-white to-tmobile-magenta/10 border border-tmobile-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-tmobile-magenta">
                    {releaseNotes.metadata.chiImprovement !== null
                      ? `${releaseNotes.metadata.chiImprovement > 0 ? '+' : ''}${releaseNotes.metadata.chiImprovement}`
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-tmobile-gray-600 mt-1">CHI Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {releaseNotes.metadata.sentimentRecovery > 0 ? '+' : ''}
                    {releaseNotes.metadata.sentimentRecovery}%
                  </div>
                  <div className="text-xs text-tmobile-gray-600 mt-1">Sentiment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tmobile-gray-900">
                    {releaseNotes.metadata.affectedCustomers}
                  </div>
                  <div className="text-xs text-tmobile-gray-600 mt-1">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tmobile-gray-900">
                    {releaseNotes.metadata.timeToRecover}
                  </div>
                  <div className="text-xs text-tmobile-gray-600 mt-1">To Recover</div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-tmobile-gray-200">
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'customer'
                    ? 'border-tmobile-magenta text-tmobile-magenta'
                    : 'border-transparent text-tmobile-gray-600 hover:text-tmobile-gray-900'
                }`}
              >
                Customer-Facing
              </button>
              <button
                onClick={() => setActiveTab('executive')}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'executive'
                    ? 'border-tmobile-magenta text-tmobile-magenta'
                    : 'border-transparent text-tmobile-gray-600 hover:text-tmobile-gray-900'
                }`}
              >
                Executive Summary
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === 'internal'
                    ? 'border-tmobile-magenta text-tmobile-magenta'
                    : 'border-transparent text-tmobile-gray-600 hover:text-tmobile-gray-900'
                }`}
              >
                Internal Notes
              </button>
            </div>

            {/* Editable Content */}
            <div className="space-y-3">
              <Label htmlFor="content">Content (Editable)</Label>
              <textarea
                id="content"
                value={getCurrentText()}
                onChange={(e) => updateCurrentText(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-tmobile-gray-300 rounded-lg focus:ring-2 focus:ring-tmobile-magenta focus:border-transparent resize-none"
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4">
              <Button
                onClick={() => handleCopy(getCurrentText(), activeTab === 'customer' ? 'Customer-facing notes' : activeTab === 'executive' ? 'Executive summary' : 'Internal notes')}
                variant="outline"
                size="sm"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
              <Button
                onClick={() => {
                  const filename = `release-notes-${activeTab}-${opportunityId.slice(0, 8)}.md`
                  handleDownload(getCurrentText(), filename)
                }}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Markdown
              </Button>
              <div className="flex-1" />
              <Button onClick={handleGenerate} variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-tmobile-magenta hover:bg-tmobile-magenta-dark"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save & Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
