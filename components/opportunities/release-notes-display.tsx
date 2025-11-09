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
import { Copy, Download, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface ReleaseNotesDisplayProps {
  releaseNotes: {
    customerFacing: string
    executiveSummary: string
    internalNotes: string
    suggestedTitle: string
    generatedAt: string
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
  opportunityTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReleaseNotesDisplay({
  releaseNotes,
  opportunityTitle,
  open,
  onOpenChange,
}: ReleaseNotesDisplayProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'executive' | 'internal'>('customer')

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

  const handleDownloadAll = () => {
    const allNotes = `# ${releaseNotes.suggestedTitle || opportunityTitle}

Generated: ${format(new Date(releaseNotes.generatedAt), 'PPP')}

---

## Customer-Facing Release Notes

${releaseNotes.customerFacing}

---

## Executive Summary

${releaseNotes.executiveSummary}

---

## Internal Notes

${releaseNotes.internalNotes}

---

## Impact Metrics

- **CHI Improvement:** ${releaseNotes.metadata.chiImprovement !== null ? `${releaseNotes.metadata.chiImprovement > 0 ? '+' : ''}${releaseNotes.metadata.chiImprovement} points` : 'N/A'}
- **Sentiment Recovery:** ${releaseNotes.metadata.sentimentRecovery > 0 ? '+' : ''}${releaseNotes.metadata.sentimentRecovery}%
- **Affected Customers:** ${releaseNotes.metadata.affectedCustomers}
- **Time to Recover:** ${releaseNotes.metadata.timeToRecover}
- **Detection Date:** ${format(new Date(releaseNotes.metadata.detectionDate), 'PPP')}
- **Fix Date:** ${format(new Date(releaseNotes.metadata.fixDate), 'PPP')}
- **Recovery Date:** ${format(new Date(releaseNotes.metadata.recoveryDate), 'PPP')}
`

    handleDownload(allNotes, `release-notes-complete-${new Date(releaseNotes.generatedAt).getTime()}.md`)
  }

  const handleCopyForSlack = () => {
    const currentText = activeTab === 'customer'
      ? releaseNotes.customerFacing
      : activeTab === 'executive'
      ? releaseNotes.executiveSummary
      : releaseNotes.internalNotes

    // Convert markdown to Slack-friendly format
    let slackText = currentText
      // Headers
      .replace(/^### (.*$)/gim, '*$1*')
      .replace(/^## (.*$)/gim, '*$1*')
      .replace(/^# (.*$)/gim, '*$1*')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '*$1*')
      // Bullets (Slack uses • or -)
      .replace(/^- /gim, '• ')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '```$1```')

    navigator.clipboard.writeText(slackText)
    toast.success('Slack-formatted notes copied to clipboard!')
  }

  const getCurrentText = () => {
    switch (activeTab) {
      case 'customer':
        return releaseNotes.customerFacing
      case 'executive':
        return releaseNotes.executiveSummary
      case 'internal':
        return releaseNotes.internalNotes
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-tmobile-magenta" />
            Release Notes
          </DialogTitle>
          <DialogDescription>
            {opportunityTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header with generation date */}
          <div className="flex items-center justify-between text-sm text-tmobile-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Generated {format(new Date(releaseNotes.generatedAt), 'PPP')}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between text-sm p-3 rounded-lg border border-tmobile-gray-200 bg-white">
            <div>
              <div className="font-medium text-tmobile-gray-900">Detected</div>
              <div className="text-tmobile-gray-600">
                {format(new Date(releaseNotes.metadata.detectionDate), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="flex-1 h-px bg-tmobile-gray-300 mx-4" />
            <div>
              <div className="font-medium text-tmobile-gray-900">Fixed</div>
              <div className="text-tmobile-gray-600">
                {format(new Date(releaseNotes.metadata.fixDate), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="flex-1 h-px bg-tmobile-gray-300 mx-4" />
            <div>
              <div className="font-medium text-green-600">Recovered</div>
              <div className="text-tmobile-gray-600">
                {format(new Date(releaseNotes.metadata.recoveryDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

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

          {/* Content Display */}
          <div className="prose prose-sm max-w-none p-4 rounded-lg border border-tmobile-gray-200 bg-white overflow-y-auto max-h-96">
            <div
              className="whitespace-pre-wrap font-mono text-sm"
              style={{ lineHeight: '1.6' }}
            >
              {getCurrentText()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-tmobile-gray-200">
            <Button
              onClick={() => handleCopy(getCurrentText(), activeTab === 'customer' ? 'Customer-facing notes' : activeTab === 'executive' ? 'Executive summary' : 'Internal notes')}
              variant="outline"
              size="sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              onClick={handleCopyForSlack}
              variant="outline"
              size="sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy for Slack
            </Button>
            <Button
              onClick={() => {
                const filename = `release-notes-${activeTab}-${new Date(releaseNotes.generatedAt).getTime()}.md`
                handleDownload(getCurrentText(), filename)
              }}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All Formats
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
