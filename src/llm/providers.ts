import { LLMConfig } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export abstract class BaseLLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateText(prompt: string): Promise<string>;
}

export class GeminiProvider extends BaseLLMProvider {
  private genAI: GoogleGenerativeAI;

  constructor(config: LLMConfig) {
    super(config);
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-pro',
        generationConfig: {
          temperature: this.config.temperature || 0.3
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Placeholder for future LLM providers
export class OpenAIProvider extends BaseLLMProvider {
  async generateText(prompt: string): Promise<string> {
    throw new Error('OpenAI provider not implemented yet');
  }
}

export class AnthropicProvider extends BaseLLMProvider {
  async generateText(prompt: string): Promise<string> {
    throw new Error('Anthropic provider not implemented yet');
  }
}

export function createLLMProvider(config: LLMConfig): BaseLLMProvider {
  switch (config.provider) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
