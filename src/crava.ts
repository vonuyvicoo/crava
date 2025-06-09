import { WebScraper } from './scraper/web-scraper';
import { SelectorGenerator } from './ai/selector-generator';
import { OutputManager } from './output/output-manager';
import { createLLMProvider } from './llm/providers';
import { ScrapingConfig, ScrapingResult, SelectorMap } from './types';

export class Crava {
  private scraper: WebScraper;
  private selectorGenerator: SelectorGenerator;

  constructor() {
    this.scraper = new WebScraper();
    // selectorGenerator will be initialized with LLM provider in scrape method
    this.selectorGenerator = null as any;
  }

  async scrape(url: string, config: ScrapingConfig): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    try {
      // Initialize LLM provider
      const llmProvider = createLLMProvider(config.llm);
      this.selectorGenerator = new SelectorGenerator(llmProvider);

      // Step 1: Initialize browser and navigate to URL
      console.log(`🚀 Initializing browser and navigating to: ${url}`);
      await this.scraper.initialize();
      
      const html = await this.scraper.navigateToUrl(url, config.timeout || 30000);
      console.log(`✅ Successfully loaded page (${html.length} characters)`);

      // Step 2: Generate selectors using AI
      console.log(`🤖 Generating selectors for keys: ${config.keys.join(', ')}`);
      const selectors = await this.selectorGenerator.generateSelectors(
        html, 
        config.keys, 
        config.customPrompt
      );
      
      console.log(`✅ Generated selectors:`, selectors);

      // Step 3: Extract data using generated selectors
      console.log(`🔍 Extracting data using generated selectors...`);
      const extractedData = await this.scraper.extractDataWithSelectors(selectors);
      
      console.log(`✅ Extracted ${extractedData.length} records`);

      // Create result object
      const result: ScrapingResult = {
        data: extractedData,
        metadata: {
          url,
          timestamp: new Date().toISOString(),
          totalRecords: extractedData.length,
          keys: config.keys
        }
      };

      const endTime = Date.now();
      console.log(`⏱️  Total execution time: ${(endTime - startTime) / 1000}s`);

      return result;

    } catch (error) {
      console.error(`❌ Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      // Always close the browser
      await this.scraper.close();
    }
  }

  async scrapeWithRetry(url: string, config: ScrapingConfig): Promise<ScrapingResult> {
    const maxRetries = config.maxRetries || 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
        return await this.scrape(url, config);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`❌ Attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Scraping failed after ${maxRetries} attempts. Last error: ${lastError!.message}`);
  }
}

// Export main function and types
export * from './types';
export { OutputManager } from './output/output-manager';

// Default export for convenience
export default Crava;
