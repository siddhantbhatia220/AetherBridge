export interface PhoneData {
  isValid: boolean;
  internationalFormat: string;
  nationalFormat: string;
  countryCode: string;
}

export interface IDataBridge {
  parsePhone(text: string, defaultRegion?: string): Promise<PhoneData[]>;
}
