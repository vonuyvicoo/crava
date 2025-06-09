export interface ScrapingConfig {
  keys: string[];
  llm: LLMConfig;
  customPrompt?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface LLMConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
  temperature?: number;
}

export interface ScrapingResult {
  data: Record<string, any>[];
  metadata: {
    url: string;
    timestamp: string;
    totalRecords: number;
    keys: string[];
  };
}

export interface SelectorMap {
  [key: string]: string;
}
