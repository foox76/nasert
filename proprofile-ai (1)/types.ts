export interface CompanyInfo {
  name: string;
  tagline: string;
  establishedYear: string;
  location: string;
  website: string;
  email: string;
  phone: string;
}

export interface CoreIdentity {
  vision: string;
  mission: string;
  aboutRaw: string;
}

export interface ServiceData {
  title: string;
  description: string;
}

export interface GeneratedContent {
  refinedVision: string;
  refinedMission: string;
  refinedAbout: string;
  refinedServices: ServiceData[];
  isGenerated: boolean;
}

export interface AppState {
  companyInfo: CompanyInfo;
  coreIdentity: CoreIdentity;
  rawServices: string;
  generated: GeneratedContent;
}