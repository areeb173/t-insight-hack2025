import { NextResponse } from 'next/server';
import { generateDownDetectorData } from '@/lib/scraper/downdetector';
import { generateOutageReportData } from '@/lib/scraper/outagereport';

export interface OutagePoint {
  city: string;
  state: string;
  lat: number;
  lng: number;
  reportCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  problemType: string;
  source: string;
  details: string;
}

/**
 * GET /api/dashboard/outages
 * Returns combined outage data from DownDetector and Outage.Report
 * for geographic visualization
 */
export async function GET() {
  try {
    // Generate data from both sources
    const downDetectorData = generateDownDetectorData();
    const outageReportData = generateOutageReportData();

    // Combine and transform data for mapping
    const outagePoints: OutagePoint[] = [];

    // Add DownDetector locations
    downDetectorData.report_data.outage_locations.forEach(location => {
      outagePoints.push({
        city: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng,
        reportCount: location.reportCount,
        severity: location.severity,
        problemType: location.problemType,
        source: 'DownDetector',
        details: `${location.reportCount} reports - ${location.problemType}`,
      });
    });

    // Add Outage.Report locations
    outageReportData.report_data.outage_locations.forEach(location => {
      // Check if city already exists from DownDetector
      const existing = outagePoints.find(
        p => p.city === location.city && p.state === location.state
      );

      if (existing) {
        // Merge data - increase report count and severity if needed
        existing.reportCount += location.reportCount;
        existing.source = 'DownDetector & Outage.Report';
        existing.details = `${existing.reportCount} total reports - Multiple issues`;

        // Update severity to highest
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        if (severityLevels[location.severity] > severityLevels[existing.severity]) {
          existing.severity = location.severity;
        }
      } else {
        // Add as new location
        outagePoints.push({
          city: location.city,
          state: location.state,
          lat: location.lat,
          lng: location.lng,
          reportCount: location.reportCount,
          severity: location.severity,
          problemType: location.problemType,
          source: 'Outage.Report',
          details: `${location.reportCount} reports - ${location.affectedServices.join(', ')} (${location.duration})`,
        });
      }
    });

    // Calculate summary statistics
    const summary = {
      totalReports: outagePoints.reduce((sum, p) => sum + p.reportCount, 0),
      affectedCities: outagePoints.length,
      criticalCount: outagePoints.filter(p => p.severity === 'critical').length,
      highCount: outagePoints.filter(p => p.severity === 'high').length,
      mediumCount: outagePoints.filter(p => p.severity === 'medium').length,
      lowCount: outagePoints.filter(p => p.severity === 'low').length,
      status: determineOverallStatus(outagePoints),
    };

    return NextResponse.json({
      success: true,
      data: outagePoints,
      summary,
      sources: {
        downdetector: {
          total_reports: downDetectorData.report_data.total_reports,
          status: downDetectorData.report_data.status,
          locations: downDetectorData.report_data.outage_locations.length,
        },
        outagereport: {
          total_reports: outageReportData.report_data.total_reports,
          status: outageReportData.report_data.status,
          locations: outageReportData.report_data.outage_locations.length,
        },
      },
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating outage data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate outage data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Determine overall network status based on outage points
 */
function determineOverallStatus(outagePoints: OutagePoint[]): string {
  const criticalCount = outagePoints.filter(p => p.severity === 'critical').length;
  const highCount = outagePoints.filter(p => p.severity === 'high').length;
  const totalReports = outagePoints.reduce((sum, p) => sum + p.reportCount, 0);

  if (criticalCount >= 5 || totalReports > 1000) {
    return 'Major Outage';
  }
  if (criticalCount >= 2 || highCount >= 5 || totalReports > 600) {
    return 'Widespread Issues';
  }
  if (highCount >= 2 || totalReports > 300) {
    return 'Service Degradation';
  }
  if (totalReports > 100) {
    return 'Minor Issues';
  }
  return 'Normal';
}
