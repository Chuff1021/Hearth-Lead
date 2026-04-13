export interface ScrapedPermit {
  permitNumber: string;
  type: string;
  subType?: string;
  status: string;
  propertyAddress: string;
  city: string;
  county: string;
  zip?: string;
  parcelNumber?: string;
  ownerName?: string;
  ownerMailingAddr?: string;
  contractorName?: string;
  contractorLicense?: string;
  subdivision?: string;
  estimatedValue?: number;
  squareFootage?: number;
  dateFiled?: string;
  dateApproved?: string;
  description?: string;
  rawData?: string;
  source: string;
}

export interface ScrapeResult {
  source: string;
  permits: ScrapedPermit[];
  error?: string;
  scrapedAt: string;
}
