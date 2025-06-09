import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

// Add stealth plugin
puppeteer.use(StealthPlugin());

export class WebScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent to look more like a real browser
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async navigateToUrl(url: string, timeout: number = 30000): Promise<string> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      console.log(`🌐 Navigating to: ${url}`);
      
      // Navigate to the URL with multiple wait conditions
      await this.page.goto(url, { 
        waitUntil: ['networkidle0', 'domcontentloaded'], 
        timeout 
      });

      console.log(`⏳ Waiting for dynamic content to load...`);
      
      // Wait for common e-commerce elements to appear
      try {
        await this.page.waitForFunction(() => {
          // Look for common product-related elements
          const productSelectors = [
            '[class*="product"]',
            '[class*="item"]',
            '[data-testid*="product"]',
            '[data-testid*="item"]',
            'article',
            '.price',
            '[class*="price"]'
          ];
          
          for (const selector of productSelectors) {
            if (document.querySelectorAll(selector).length > 0) {
              return true;
            }
          }
          return false;
        }, { timeout: 10000 });
        console.log(`✅ Product elements detected`);
      } catch (waitError) {
        console.log(`⚠️  No specific product elements found, continuing...`);
      }

      // Additional wait for any remaining dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Scroll to load lazy-loaded content
      console.log(`📜 Scrolling to load lazy content...`);
      await this.page.evaluate(() => {
        return new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if(totalHeight >= scrollHeight || totalHeight >= 3000) { // Limit scroll to prevent infinite scrolling
              clearInterval(timer);
              resolve(null);
            }
          }, 100);
        });
      });

      // Scroll back to top
      await this.page.evaluate(() => window.scrollTo(0, 0));
      
      // Final wait for any content that might have loaded during scroll
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get the HTML content
      const html = await this.page.content();
      console.log(`📄 Final HTML content: ${html.length} characters`);
      
      return html;
    } catch (error) {
      throw new Error(`Failed to navigate to ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractDataWithSelectors(selectors: Record<string, string>): Promise<Record<string, any>[]> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    try {
      console.log('🔍 Extracting data with selectors:', selectors);
      
      const data = await this.page.evaluate((selectorMap) => {
        const results: Record<string, any>[] = [];
        
        // Get all elements for each selector
        const elementsByKey: Record<string, NodeListOf<Element>> = {};
        const keys = Object.keys(selectorMap);
        
        // Find elements for each selector
        for (const [key, selector] of Object.entries(selectorMap)) {
          elementsByKey[key] = document.querySelectorAll(selector);
          console.log(`Selector "${selector}" for key "${key}" found ${elementsByKey[key].length} elements`);
        }
        
        // Find the maximum number of elements to determine how many records we might have
        const maxElements = Math.max(...Object.values(elementsByKey).map(nodeList => nodeList.length));
        
        if (maxElements === 0) {
          console.log('No elements found for any selector');
          return results;
        }
        
        // Method 1: Try to extract data by index (assuming elements are in order)
        for (let i = 0; i < maxElements; i++) {
          const item: Record<string, any> = {};
          let hasData = false;
          
          for (const key of keys) {
            const elements = elementsByKey[key];
            if (elements[i]) {
              const text = elements[i].textContent?.trim() || '';
              if (text) {
                item[key] = text;
                hasData = true;
              } else {
                item[key] = '';
              }
            } else {
              item[key] = '';
            }
          }
          
          if (hasData) {
            results.push(item);
          }
        }
        
        // If we didn't get good results with index method, try a simpler approach
        if (results.length === 0) {
          console.log('Index method failed, trying simple extraction');
          const item: Record<string, any> = {};
          let hasData = false;
          
          for (const [key, selector] of Object.entries(selectorMap)) {
            const element = document.querySelector(selector);
            if (element) {
              const text = element.textContent?.trim() || '';
              if (text) {
                item[key] = text;
                hasData = true;
              } else {
                item[key] = '';
              }
            } else {
              item[key] = '';
            }
          }
          
          if (hasData) {
            results.push(item);
          }
        }
        
        console.log(`Extracted ${results.length} records:`, results);
        return results;
      }, selectors);

      console.log(`✅ Successfully extracted ${data.length} records`);
      return data;
    } catch (error) {
      console.error('❌ Error in extractDataWithSelectors:', error);
      throw new Error(`Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
