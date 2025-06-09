const { SelectorGenerator } = require("../dist/ai/selector-generator");
const { GeminiProvider } = require("../dist/llm/providers");

// Simple test without browser dependencies
async function testSelectorGeneration() {
    console.log("🧪 Testing AI Selector Generation\n");

    // Mock HTML content for testing
    const testHtml = `
    <div class="container">
      <div class="product-card">
        <h3 class="product-title">Gaming Laptop</h3>
        <span class="price-tag">$1499.99</span>
        <div class="category-badge">Electronics</div>
      </div>
      <div class="product-card">
        <h3 class="product-title">Wireless Headphones</h3>
        <span class="price-tag">$199.99</span>
        <div class="category-badge">Audio</div>
      </div>
    </div>
  `;

    const keys = ["Product Name", "Price", "Category"];

    // Create a mock LLM provider for testing
    const mockLLMProvider = {
        generateText: async (prompt) => {
            console.log("🤖 AI Processing...");
            // Simulate AI response
            return JSON.stringify({
                "Product Name": ".product-title",
                Price: ".price-tag",
                Category: ".category-badge",
            });
        },
    };

    try {
        const selectorGenerator = new SelectorGenerator(mockLLMProvider);
        const selectors = await selectorGenerator.generateSelectors(
            testHtml,
            keys
        );

        console.log("✅ Generated Selectors:");
        Object.entries(selectors).forEach(([key, selector]) => {
            console.log(`   ${key}: ${selector}`);
        });

        console.log("\n🎯 These selectors would be used to extract:");
        console.log("   • Gaming Laptop → $1499.99 → Electronics");
        console.log("   • Wireless Headphones → $199.99 → Audio");

        console.log("\n✅ Selector generation test completed successfully!");
    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
    }
}

testSelectorGeneration();
