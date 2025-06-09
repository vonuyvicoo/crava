import Crava, { ScrapingConfig } from '../src/index';

// Example usage function
async function exampleUsage() {
  const crava = new Crava();
  
  // Example 1: Scraping product data from an e-commerce site
  const config: ScrapingConfig = {
    keys: ['Product Name', 'Price', 'Product Category'],
    llm: {
      provider: 'gemini',
      apiKey: 'your-gemini-api-key-here', // Replace with your actual API key
      model: 'gemini-pro',
      temperature: 0.3
    },
    outputType: 'csv',
    customPrompt: 'Focus on product listings and ensure prices include currency symbols',
    maxRetries: 3,
    timeout: 30000
  };

  try {
    // Replace with actual URL
    const result = await crava.scrape('https://example-ecommerce-site.com/products', config);
    console.log('Scraping completed successfully!');
    console.log(`Found ${result.metadata.totalRecords} records`);
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}

// Example 2: Scraping news articles
async function scrapeNewsExample() {
  const crava = new Crava();
  
  const config: ScrapingConfig = {
    keys: ['Article Title', 'Author', 'Publication Date', 'Summary'],
    llm: {
      provider: 'gemini',
      apiKey: 'your-gemini-api-key-here',
    },
    outputType: 'json',
    customPrompt: 'Look for news articles and blog posts. Extract publication dates in ISO format if possible.'
  };

  try {
    const result = await crava.scrapeWithRetry('https://example-news-site.com', config);
    console.log('News scraping completed!');
  } catch (error) {
    console.error('News scraping failed:', error);
  }
}

// Run examples (uncomment to test)
// exampleUsage();
// scrapeNewsExample();

export { exampleUsage, scrapeNewsExample };
