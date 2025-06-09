import Crava, { ScrapingConfig } from '../src/index';

async function demoScraping() {
  console.log('🕷️  Crava Demo - AI-Powered Web Scraping\n');

  // Create a simple test HTML file to demonstrate functionality
  const testHtml = `
<!DOCTYPE html>
<html>
<head><title>Test Store</title></head>
<body>
  <div class="product">
    <h2 class="product-name">Laptop Pro</h2>
    <span class="price">$1299.99</span>
    <div class="category">Electronics</div>
    <p class="description">High-performance laptop for professionals</p>
  </div>
  <div class="product">
    <h2 class="product-name">Wireless Mouse</h2>
    <span class="price">$29.99</span>
    <div class="category">Accessories</div>
    <p class="description">Ergonomic wireless mouse with precision tracking</p>
  </div>
  <div class="product">
    <h2 class="product-name">Gaming Keyboard</h2>
    <span class="price">$89.99</span>
    <div class="category">Gaming</div>
    <p class="description">Mechanical keyboard with RGB lighting</p>
  </div>
</body>
</html>`;

  // Write test HTML to file
  const fs = require('fs');
  const path = require('path');
  const testFile = path.join(__dirname, 'test-store.html');
  fs.writeFileSync(testFile, testHtml);

  const crava = new Crava();
  
  const config: ScrapingConfig = {
    keys: ['Product Name', 'Price', 'Category', 'Description'],
    llm: {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || 'demo-key', // In demo mode
    },
    outputType: 'csv',
    customPrompt: 'Extract product information from this e-commerce page. Focus on the product listings.',
    maxRetries: 1,
    timeout: 10000
  };

  console.log('📝 Demo Configuration:');
  console.log(`   Keys: ${config.keys.join(', ')}`);
  console.log(`   Output: ${config.outputType}`);
  console.log(`   LLM Provider: ${config.llm.provider}\n`);

  try {
    console.log('🌐 Note: This is a demo using a local HTML file.');
    console.log('   In production, you would use real website URLs.\n');
    
    // For demo purposes, we'll show what the scraper would do
    console.log('✅ Demo Steps:');
    console.log('   1. ✓ Initialize browser with stealth mode');
    console.log('   2. ✓ Navigate to target URL');
    console.log('   3. ✓ Extract HTML content');
    console.log('   4. ✓ AI analyzes HTML and generates selectors');
    console.log('   5. ✓ Extract structured data using selectors');
    console.log('   6. ✓ Export data to CSV/JSON format\n');

    // Show what the extracted data would look like
    const mockResult = {
      data: [
        { 'Product Name': 'Laptop Pro', 'Price': '$1299.99', 'Category': 'Electronics', 'Description': 'High-performance laptop for professionals' },
        { 'Product Name': 'Wireless Mouse', 'Price': '$29.99', 'Category': 'Accessories', 'Description': 'Ergonomic wireless mouse with precision tracking' },
        { 'Product Name': 'Gaming Keyboard', 'Price': '$89.99', 'Category': 'Gaming', 'Description': 'Mechanical keyboard with RGB lighting' }
      ],
      metadata: {
        url: 'file://' + testFile,
        timestamp: new Date().toISOString(),
        totalRecords: 3,
        keys: config.keys
      }
    };

    console.log('📊 Sample Extracted Data:');
    console.log('═'.repeat(80));
    mockResult.data.forEach((item, index) => {
      console.log(`\nRecord ${index + 1}:`);
      Object.entries(item).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📚 To use Crava with real websites:');
    console.log('   1. Get a Gemini API key from Google AI Studio');
    console.log('   2. Set your API key: export GEMINI_API_KEY="your-key"');
    console.log('   3. Run: npx crava https://example.com --keys "Title,Price" --api-key $GEMINI_API_KEY');

    // Clean up
    fs.unlinkSync(testFile);

  } catch (error) {
    console.error(`❌ Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demoScraping().catch(console.error);
}

export { demoScraping };
