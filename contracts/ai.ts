export interface IAIBridge {
  summarize(text: string): Promise<string>;
  analyze(data: any): Promise<any>;
  generate(prompt: string): Promise<string>;
  extractDataFromImages(images: string[]): Promise<any[]>;
}

export type AIResponse = {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
};
