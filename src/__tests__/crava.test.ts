import { WebScraper } from '../scraper/web-scraper';
import { SelectorGenerator } from '../ai/selector-generator';
import { GeminiProvider } from '../llm/providers';
import { OutputManager } from '../output/output-manager';

// Mock puppeteer to avoid browser dependency in tests
jest.mock('puppeteer-extra', () => ({
  use: jest.fn(),
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setUserAgent: jest.fn(),
      setViewport: jest.fn(),
      goto: jest.fn(),
      content: jest.fn().mockResolvedValue('<html><body>Test HTML</body></html>'),
      evaluate: jest.fn().mockResolvedValue([]),
    }),
    close: jest.fn(),
  }),
}));

jest.mock('puppeteer-extra-plugin-stealth', () => jest.fn());

describe('WebScraper', () => {
  let scraper: WebScraper;

  beforeEach(() => {
    scraper = new WebScraper();
  });

  afterEach(async () => {
    await scraper.close();
  });

  test('should initialize browser successfully', async () => {
    await expect(scraper.initialize()).resolves.not.toThrow();
  });

  test('should navigate to URL and get HTML', async () => {
    await scraper.initialize();
    const html = await scraper.navigateToUrl('https://example.com');
    expect(html).toContain('<html');
    expect(html.length).toBeGreaterThan(0);
  });
});

describe('SelectorGenerator', () => {
  let selectorGenerator: SelectorGenerator;
  let mockLLMProvider: GeminiProvider;

  beforeEach(() => {
    mockLLMProvider = {
      generateText: jest.fn().mockResolvedValue('{"Product Name": ".product-title", "Price": ".price"}')
    } as any;
    selectorGenerator = new SelectorGenerator(mockLLMProvider);
  });

  test('should generate selectors from HTML', async () => {
    const html = '<div class="product"><h2 class="product-title">Test Product</h2><span class="price">$10</span></div>';
    const keys = ['Product Name', 'Price'];

    const selectors = await selectorGenerator.generateSelectors(html, keys);
    
    expect(selectors).toHaveProperty('Product Name');
    expect(selectors).toHaveProperty('Price');
  });

  test('should handle AI response errors gracefully', async () => {
    mockLLMProvider.generateText = jest.fn().mockResolvedValue('invalid json response');
    
    const html = '<div>test</div>';
    const keys = ['Product Name'];

    const selectors = await selectorGenerator.generateSelectors(html, keys);
    
    // Should fallback to default selectors
    expect(selectors).toHaveProperty('Product Name');
  });
});

describe('OutputManager', () => {
  const mockData = {
    data: [
      { 'Product Name': 'Test Product', 'Price': '$10' },
      { 'Product Name': 'Another Product', 'Price': '$20' }
    ],
    metadata: {
      url: 'https://example.com',
      timestamp: '2025-01-01T00:00:00.000Z',
      totalRecords: 2,
      keys: ['Product Name', 'Price']
    }
  };

  test('should format console output correctly', () => {
    const output = OutputManager.formatConsoleOutput(mockData);
    
    expect(output).toContain('Scraping Results');
    expect(output).toContain('Test Product');
    expect(output).toContain('$10');
    expect(output).toContain('Total Records: 2');
  });

  test('should handle empty data', () => {
    const emptyData = { ...mockData, data: [], metadata: { ...mockData.metadata, totalRecords: 0 } };
    const output = OutputManager.formatConsoleOutput(emptyData);
    
    expect(output).toContain('No data found');
  });
});
