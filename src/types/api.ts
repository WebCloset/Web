// API Response Types

export interface ApiProductSource {
  id: string;
  marketplace_code: string;
  source_item_id: string;
  title: string;
  brand: string;
  condition: string | null;
  price_cents: number;
  currency: string;
  image_url: string;
  seller_url: string;
  size?: string | null;
  color?: string | null;
  category?: string | null;
}

export interface ApiSearchResult {
  _index: string;
  _id: string;
  _nested?: {
    field: string;
    offset: number;
  };
  _score: number;
  _source: ApiProductSource;
}

// API response is an array of arrays (groups of results)
export type ApiSearchResponse = ApiSearchResult[][];

// Transformed Product Type for UI
export interface Product {
  id: string;
  title: string;
  brand: string;
  condition: string | null;
  price: number;
  currency: string;
  imageUrl: string;
  sellerUrl: string;
  size?: string | null;
  color?: string | null;
  category?: string | null;
  marketplace: string;
  score: number;
}
