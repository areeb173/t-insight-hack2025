/**
 * Outage.Report Data Loader
 * Loads static outage data modeled after real Outage.Report JSON structure
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface OutageLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
  reportCount: number;
  problemType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedServices: string[];
  duration: string;
}

export interface OutageReportData {
  total_reports: number;
  affected_cities: number;
  status: string;
  outage_locations: OutageLocation[];
  services_affected: {
    service: string;
    percentage: number;
  }[];
  average_duration: string;
}

export interface OutageReportResult {
  report_data: OutageReportData;
  source: string;
  fetched_at: string;
}

/**
 * Load Outage.Report data from static JSON file
 * This mimics real Outage.Report data structure
 */
export function generateOutageReportData(): OutageReportResult {
  try {
    const dataPath = join(process.cwd(), 'lib/scraper/data/outagereport-data.json');
    const fileContent = readFileSync(dataPath, 'utf-8');
    const reportData: OutageReportData = JSON.parse(fileContent);

    return {
      report_data: reportData,
      source: 'outagereport',
      fetched_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to load outagereport data:', error);

    // Return empty data as fallback
    return {
      report_data: {
        total_reports: 0,
        affected_cities: 0,
        status: 'normal',
        outage_locations: [],
        services_affected: [],
        average_duration: '0m',
      },
      source: 'outagereport',
      fetched_at: new Date().toISOString(),
    };
  }
}
