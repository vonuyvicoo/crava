# Crava 🕷️✨

AI-powered web scraping that extracts structured data as JSON. Crava uses artificial intelligence to automatically detect and extract data from web pages without manual selector configuration.

## 🚀 Features

-   🤖 **AI-Powered Extraction**: Automatically generates CSS selectors using Google Gemini AI
-   🥷 **Stealth Scraping**: Uses Puppeteer with stealth plugins to avoid bot detection
-   📊 **JSON Output**: Clean, structured JSON data output
-   🔄 **Smart Retry Logic**: Built-in retry mechanism with exponential backoff
-   🧩 **Extensible LLM Support**: Ready for OpenAI, Anthropic, and other AI providers
-   ⚡ **TypeScript**: Full TypeScript support with comprehensive type definitions
-   🛠️ **CLI Interface**: Use via command line or programmatically
-   🌐 **Global Installation**: Available as `crava` command or `npx crava`

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g crava
```

### Project Installation

```bash
npm install crava
```

## 🎯 Quick Start

### CLI Usage

```bash
# Console output
crava https://example-shop.com --keys "Product Name,Price,Rating" --api-key YOUR_GEMINI_API_KEY

# Save to file
crava https://example-shop.com --keys "Product Name,Price" --api-key YOUR_API_KEY --output results.json

# With custom prompt
crava https://news-site.com --keys "Headline,Author,Date" --api-key YOUR_API_KEY --custom-prompt "Focus on main articles only"
```

### Programmatic Usage

```typescript
import { Crava } from "crava";

const crava = new Crava();

const config = {
    keys: ["Product Name", "Price", "Product Category"],
    llm: {
        provider: "gemini",
        apiKey: "your-gemini-api-key",
        model: "gemini-2.5-pro-preview-06-05",
    },
};

// Scrape data
const result = await crava.scrape("https://example-shop.com", config);
console.log(`Extracted ${result.metadata.totalRecords} records`);
console.log(result.data); // Array of extracted objects
```

## ⚙️ Configuration

### CLI Options

```bash
Options:
  --keys <string>        Comma-separated list of data fields to extract
  --api-key <string>     Gemini API key
  --output <filename>    Save JSON to file (default: console output only)
  --model <string>       AI model to use (default: gemini-2.5-pro-preview-06-05)
  --timeout <number>     Page load timeout in ms (default: 30000)
  --custom-prompt <str>  Additional instructions for the AI
  --help                 Show help message
```

### ScrapingConfig Interface

```typescript
interface ScrapingConfig {
    keys: string[]; // Data fields to extract
    llm: LLMConfig; // AI provider configuration
    customPrompt?: string; // Additional AI instructions
    maxRetries?: number; // Retry attempts (default: 3)
    timeout?: number; // Page load timeout in ms (default: 30000)
}
```

### LLMConfig Interface

```typescript
interface LLMConfig {
    provider: "gemini" | "openai" | "anthropic"; // AI provider
    apiKey: string; // API key
    model?: string; // Model name
    temperature?: number; // Response creativity (0-1)
}
```

## 🌟 Examples

### E-commerce Product Scraping

```typescript
import { Crava } from "crava";

const crava = new Crava();

const config = {
    keys: ["Product Name", "Price", "Rating", "Availability"],
    llm: {
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-2.5-pro-preview-06-05",
    },
    customPrompt:
        "Focus on product listings. Extract numerical ratings and stock status.",
};

const result = await crava.scrape("https://shop.example.com/products", config);

// Save to file
import { OutputManager } from "crava/dist/output/output-manager";
await OutputManager.exportToJson(result, "products.json");
```

### News Article Scraping

```typescript
const config = {
    keys: ["Headline", "Author", "Publication Date", "Summary"],
    llm: {
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
    },
    customPrompt: "Extract news articles. Format dates as ISO strings.",
};

const result = await crava.scrapeWithRetry("https://news.example.com", config);
```

### CLI Examples

```bash
# Basic scraping with console output
crava https://quotes.toscrape.com --keys "Quote,Author,Tags" --api-key YOUR_API_KEY

# Save results to file
crava https://books.toscrape.com --keys "Title,Price,Rating" --api-key YOUR_API_KEY --output books.json

# With custom model and prompt
crava https://news.ycombinator.com --keys "Title,Points,Comments" \
  --api-key YOUR_API_KEY \
  --model gemini-2.5-pro-preview-06-05 \
  --custom-prompt "Focus on the main story listings"

# Using npx (no installation required)
npx crava https://example.com --keys "Title,Description" --api-key YOUR_API_KEY
```

## 📚 API Reference

### `Crava.scrape(url, config)`

Scrapes data from a single URL.

**Parameters:**

-   `url` (string): Target URL to scrape
-   `config` (ScrapingConfig): Scraping configuration

**Returns:** `Promise<ScrapingResult>`

### `Crava.scrapeWithRetry(url, config)`

Scrapes data with automatic retry logic and exponential backoff.

**Parameters:**

-   `url` (string): Target URL to scrape
-   `config` (ScrapingConfig): Scraping configuration

**Returns:** `Promise<ScrapingResult>`

### ScrapingResult Interface

```typescript
interface ScrapingResult {
    data: Record<string, any>[]; // Array of extracted objects
    metadata: {
        url: string; // Source URL
        timestamp: string; // Extraction timestamp
        totalRecords: number; // Number of records found
        keys: string[]; // Requested data fields
    };
}
```

### OutputManager Utilities

```typescript
import { OutputManager } from "crava/dist/output/output-manager";

// Save as JSON file
await OutputManager.exportToJson(result, "output.json");

// Save as CSV file
await OutputManager.exportToCsv(result, "output.csv");

// Console formatting
console.log(OutputManager.formatConsoleOutput(result));
```

## 🤖 Supported AI Providers

### Google Gemini (Default & Recommended)

```typescript
const config = {
    llm: {
        provider: "gemini",
        apiKey: "your-gemini-api-key",
        model: "gemini-2.5-pro-preview-06-05", // Latest model
        temperature: 0.3, // Optional: Controls creativity (0-1)
    },
};
```

**Getting a Gemini API Key:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set it as environment variable: `export GEMINI_API_KEY="your-key"`

### OpenAI (Architecture Ready)

```typescript
const config = {
    llm: {
        provider: "openai",
        apiKey: "your-openai-api-key",
        model: "gpt-4o", // or gpt-3.5-turbo
        temperature: 0.3,
    },
};
```

### Anthropic (Architecture Ready)

```typescript
const config = {
    llm: {
        provider: "anthropic",
        apiKey: "your-anthropic-api-key",
        model: "claude-3-5-sonnet-20241022",
        temperature: 0.3,
    },
};
```

## 🔧 How It Works

1. **🌐 Page Loading**: Crava uses Puppeteer with stealth plugins to load the target webpage, avoiding bot detection
2. **🧠 AI Analysis**: The page HTML is cleaned and sent to AI (Gemini) to analyze content structure and generate extraction selectors
3. **🎯 Smart Extraction**: Generated selectors are used to extract structured data, with fallback strategies for dynamic content
4. **📋 Data Processing**: Extracted data is cleaned, validated, and formatted as structured JSON
5. **💾 Output**: Results can be displayed in console or saved to JSON/CSV files

## 💡 Best Practices

### ✅ Do's

-   **Use Descriptive Keys**: "Product Name" instead of "name"
-   **Add Custom Prompts**: Provide context like "Focus on main product listings"
-   **Handle Errors**: Always wrap scraping calls in try-catch blocks
-   **Store API Keys Securely**: Use environment variables or secret management
-   **Test on Simple Pages First**: Start with well-structured sites
-   **Respect Rate Limits**: Add delays between requests for the same domain

### ❌ Don'ts

-   Don't scrape sites without checking robots.txt
-   Don't use overly generic key names like "text" or "link"
-   Don't ignore error responses - they contain valuable debugging info
-   Don't exceed reasonable timeout values (>60s)
-   Don't hardcode API keys in your source code

### 🎯 Pro Tips

```typescript
// Use specific, descriptive field names
const goodConfig = {
    keys: ["Product Title", "Sale Price", "Customer Rating", "Stock Status"],
};

// Add context with custom prompts
const betterConfig = {
    keys: ["Product Title", "Sale Price"],
    customPrompt: "Extract only products that are currently on sale",
};

// Handle dynamic content
const robustConfig = {
    keys: ["Article Title", "Author"],
    timeout: 45000, // Longer timeout for slow sites
    maxRetries: 5, // More retries for unreliable sites
};
```

## ⚠️ Limitations & Considerations

-   **AI Dependency**: Requires AI provider API key and internet connection
-   **Performance**: Speed depends on page complexity and AI response time
-   **Anti-Bot Measures**: Some websites may block automated scraping despite stealth mode
-   **Dynamic Content**: Heavy JavaScript sites may need longer timeout values
-   **Rate Limits**: AI providers have rate limits that may affect high-volume usage
-   **Data Quality**: AI extraction accuracy depends on page structure and content clarity

## 🚀 Performance Tips

```typescript
// For better performance on similar pages
const config = {
    keys: ["Title", "Price"],
    llm: {
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.1, // Lower temperature = more consistent results
    },
    timeout: 20000, // Shorter timeout for fast sites
    maxRetries: 2, // Fewer retries for reliable sites
};

// For complex or slow sites
const robustConfig = {
    keys: ["Article Title", "Full Content", "Author"],
    llm: {
        provider: "gemini",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.3,
    },
    timeout: 60000, // Longer timeout
    maxRetries: 5, // More retries
    customPrompt:
        "Wait for all content to load. Focus on main article content.",
};
```

## 🛠️ Development & Testing

### Running Tests

```bash
cd /path/to/crava/package
npm test
```

### Building from Source

```bash
git clone <repository-url>
cd crava/package
npm install
npm run build
```

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Install globally for testing
npm install -g .

# Test CLI
crava --help
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
2. **Create a Feature Branch**
    ```bash
    git checkout -b feature/amazing-feature
    ```
3. **Make Your Changes**
4. **Add Tests**
5. **Ensure All Tests Pass**
    ```bash
    npm test
    npm run build
    ```
6. **Submit a Pull Request**

### Contribution Ideas

-   Add support for more AI providers (OpenAI, Anthropic)
-   Improve error handling and retry logic
-   Add more output formats (XML, YAML)
-   Enhance documentation and examples
-   Performance optimizations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support & Resources

-   **🐛 Issues**: [GitHub Issues](https://github.com/your-repo/crava/issues) - Report bugs and request features
-   **📖 Documentation**: Check the `examples/` directory for more use cases
-   **🔑 API Keys**:
    -   [Google AI Studio](https://makersuite.google.com/app/apikey) - Get your Gemini API key
    -   [OpenAI Platform](https://platform.openai.com/api-keys) - Get your OpenAI API key
-   **💬 Discussions**: GitHub Discussions for questions and ideas

## 🎉 Changelog

### v1.0.0

-   ✅ Initial release with Gemini AI integration
-   ✅ CLI interface with global command support
-   ✅ TypeScript support with full type definitions
-   ✅ Puppeteer stealth mode for bot detection avoidance
-   ✅ JSON output with optional file saving
-   ✅ Comprehensive error handling and retry logic
-   ✅ Extensible architecture for multiple AI providers

---

**Made with ❤️ by the Crava team**

_Star ⭐ this repo if you find it useful!_
