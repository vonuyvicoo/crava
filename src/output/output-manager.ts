import * as csvWriter from 'csv-writer';
import * as path from 'path';
import * as fs from 'fs';
import { ScrapingResult } from '../types';

export class OutputManager {
  static async exportToCsv(data: ScrapingResult, outputPath?: string): Promise<string> {
    if (data.data.length === 0) {
      throw new Error('No data to export');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = outputPath || `scraped-data-${timestamp}.csv`;
    const fullPath = path.resolve(fileName);

    // Get headers from the data keys
    const headers = data.metadata.keys.map(key => ({ id: key, title: key }));

    const writer = csvWriter.createObjectCsvWriter({
      path: fullPath,
      header: headers
    });

    try {
      await writer.writeRecords(data.data);
      return fullPath;
    } catch (error) {
      throw new Error(`Failed to write CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async exportToJson(data: ScrapingResult, outputPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = outputPath || `scraped-data-${timestamp}.json`;
    const fullPath = path.resolve(fileName);

    try {
      await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
      return fullPath;
    } catch (error) {
      throw new Error(`Failed to write JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static formatConsoleOutput(data: ScrapingResult): string {
    const { data: records, metadata } = data;
    
    let output = `\n=== Scraping Results ===\n`;
    output += `URL: ${metadata.url}\n`;
    output += `Timestamp: ${metadata.timestamp}\n`;
    output += `Total Records: ${metadata.totalRecords}\n`;
    output += `Keys: ${metadata.keys.join(', ')}\n\n`;

    if (records.length === 0) {
      output += 'No data found.\n';
      return output;
    }

    // Display first few records as table
    const displayRecords = records.slice(0, 5);
    
    output += `Sample Data (showing ${displayRecords.length} of ${records.length} records):\n`;
    output += '='.repeat(80) + '\n';
    
    for (let i = 0; i < displayRecords.length; i++) {
      output += `\nRecord ${i + 1}:\n`;
      for (const key of metadata.keys) {
        output += `  ${key}: ${displayRecords[i][key] || 'N/A'}\n`;
      }
    }
    
    if (records.length > 5) {
      output += `\n... and ${records.length - 5} more records\n`;
    }
    
    return output;
  }
}
