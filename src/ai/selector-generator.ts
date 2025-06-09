import { BaseLLMProvider } from '../llm/providers';
import { SelectorMap } from '../types';

export class SelectorGenerator {
  private llmProvider: BaseLLMProvider;

  constructor(llmProvider: BaseLLMProvider) {
    this.llmProvider = llmProvider;
  }

  async generateSelectors(html: string, keys: string[], customPrompt?: string): Promise<SelectorMap> {
    // Clean and truncate HTML to avoid token limits
    const cleanHtml = this.cleanHtml(html);
    console.log(`📏 Cleaned HTML length: ${cleanHtml.length} characters`);
    
    const prompt = this.buildPrompt(cleanHtml, keys, customPrompt);
    
    try {
      console.log('📤 Sending prompt to AI...');
      const response = await this.llmProvider.generateText(prompt);
      console.log('📥 Full AI Response:');
      console.log('================================');
      console.log(response);
      console.log('================================');
      return this.parseSelectorsFromResponse(response, keys);
    } catch (error) {
      console.error('❌ LLM Provider Error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Failed to generate selectors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanHtml(html: string): string {
    // Remove scripts, styles, and comments
    let cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      
      .trim();

    // Truncate if too long (keep first 8000 characters to stay within token limits)
    //if (cleaned.length > 8000) {
    //  cleaned = cleaned.substring(0, 8000) + '...';
    //}

    return cleaned;
  }

  private buildPrompt(html: string, keys: string[], customPrompt?: string): string {
    const basePrompt = `
You are an expert web scraper. Analyze the following HTML and generate CSS selectors to extract the specified data fields.

HTML Content:
${html}

Data fields to extract:
${keys.map(key => `- ${key}`).join('\n')}

${customPrompt ? `Additional instructions: ${customPrompt}` : ''}

Requirements:
1. Provide CSS selectors that will extract the specified data fields
2. Look for patterns in the HTML that indicate repeated data structures (like product listings, articles, etc.)
3. Prefer more specific selectors over generic ones
4. If multiple items exist on the page, the selectors should work for extracting data from each item
5. Return the response in JSON format only, with no additional text

Expected JSON format:
{
  "${keys[0]}": "css-selector-here",
  "${keys[1]}": "css-selector-here",
  ...
}

Example response:
{
  "Product Name": ".product-title h3",
  "Price": ".price-display .amount",
  "Product Category": ".breadcrumb li:last-child"
}

Analyze the HTML and provide the JSON response:`;

    return basePrompt;
  }

  private parseSelectorsFromResponse(response: string, keys: string[]): SelectorMap {
    console.log('🔍 Parsing AI response for selectors...');
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('No JSON found in AI response:', response.substring(0, 300));
        throw new Error('No JSON found in response');
      }

      console.log('📝 Found JSON in response:', jsonMatch[0]);
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate that all keys are present
      const selectorMap: SelectorMap = {};
      for (const key of keys) {
        if (parsed[key]) {
          selectorMap[key] = parsed[key];
        } else {
          console.warn(`Key "${key}" not found in AI response, using fallback`);
          // Fallback: try to find a reasonable selector
          selectorMap[key] = this.generateFallbackSelector(key);
        }
      }

      console.log('✅ Successfully parsed selectors:', selectorMap);
      return selectorMap;
    } catch (error) {
      // If parsing fails, generate fallback selectors
      console.warn('Failed to parse AI response, using fallback selectors. Error:', error instanceof Error ? error.message : 'Unknown error');
      console.warn('Raw AI response was:', response);
      return this.generateFallbackSelectors(keys);
    }
  }

  private generateFallbackSelector(key: string): string {
    const lowercaseKey = key.toLowerCase();
    
    // Common patterns for different data types
    if (lowercaseKey.includes('name') || lowercaseKey.includes('title')) {
      return 'h1, h2, h3, .title, .name, [data-testid*="title"], [data-testid*="name"]';
    } else if (lowercaseKey.includes('price')) {
      return '.price, .cost, .amount, [data-testid*="price"], [class*="price"]';
    } else if (lowercaseKey.includes('category')) {
      return '.category, .breadcrumb, .tags, [data-testid*="category"]';
    } else if (lowercaseKey.includes('description')) {
      return '.description, .summary, .content, p';
    } else {
      return `[data-testid*="${lowercaseKey}"], [class*="${lowercaseKey}"], [id*="${lowercaseKey}"]`;
    }
  }

  private generateFallbackSelectors(keys: string[]): SelectorMap {
    const selectorMap: SelectorMap = {};
    
    for (const key of keys) {
      selectorMap[key] = this.generateFallbackSelector(key);
    }
    
    return selectorMap;
  }
}
