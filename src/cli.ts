#!/usr/bin/env node

import { Crava } from './crava';
import { ScrapingConfig } from './types';

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
Crava CLI - AI-powered web scraping

Usage:
  crava <url> --keys "key1,key2,key3" --api-key <gemini-api-key> [options]
  npx crava <url> --keys "key1,key2,key3" --api-key <gemini-api-key> [options]

Options:
  --keys <string>        Comma-separated list of data fields to extract
  --api-key <string>     Gemini API key
  --output <filename>    Save JSON to file (default: console output only)
  --model <string>       AI model to use (default: gemini-2.5-pro-preview-06-05)
  --timeout <number>     Page load timeout in ms (default: 30000)
  --custom-prompt <str>  Additional instructions for the AI
  --help                 Show this help message

Examples:
  crava https://example-shop.com --keys "Product Name,Price,Rating" --api-key YOUR_API_KEY
  crava https://news-site.com --keys "Headline,Author,Date" --api-key YOUR_API_KEY --output results.json
  npx crava https://example-shop.com --keys "Product Name,Price,Rating" --api-key YOUR_API_KEY
  `);
}

async function main() {
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  const url = args[0];
  if (!url || !url.startsWith('http')) {
    console.error('❌ Please provide a valid URL');
    process.exit(1);
  }

  let keys: string[] = [];
  let apiKey = '';
  let outputFilename = '';
  let model = 'gemini-2.5-pro-preview-06-05';
  let timeout = 30000;
  let customPrompt = '';

  // Parse arguments
  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--keys':
        keys = value.split(',').map(k => k.trim());
        break;
      case '--api-key':
        apiKey = value;
        break;
      case '--output':
        outputFilename = value;
        break;
      case '--model':
        model = value;
        break;
      case '--timeout':
        timeout = parseInt(value);
        break;
      case '--custom-prompt':
        customPrompt = value;
        break;
    }
  }

  if (!apiKey) {
    console.error('❌ Please provide a Gemini API key with --api-key');
    process.exit(1);
  }

  if (keys.length === 0) {
    console.error('❌ Please provide data keys with --keys "key1,key2,key3"');
    process.exit(1);
  }

  const config: ScrapingConfig = {
    keys,
    llm: {
      provider: 'gemini',
      apiKey,
      model,
    },
    customPrompt,
    timeout,
    maxRetries: 3
  };

  console.log(`🚀 Starting Crava scraper...`);
  console.log(`📍 URL: ${url}`);
  console.log(`🔑 Keys: ${keys.join(', ')}`);
  console.log(`📊 Output: JSON`);

  try {
    const crava = new Crava();
    const result = await crava.scrapeWithRetry(url, config);
    
    console.log(`✅ Scraping completed successfully!`);
    console.log(`📈 Total records: ${result.metadata.totalRecords}`);
    
    if (result.metadata.totalRecords === 0) {
      console.log(`💡 No data found. Try adjusting your keys or adding a custom prompt.`);
    }

    // If output filename is provided, save to file
    if (outputFilename) {
      const { OutputManager } = await import('./output/output-manager');
      const fullPath = await OutputManager.exportToJson(result, outputFilename);
      console.log(`💾 Data exported to JSON: ${fullPath}`);
    } else {
      // Otherwise, output to console
      console.log('\n📄 Results:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
