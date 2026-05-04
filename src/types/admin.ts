export type SourceCode = 'amazon' | 'ebay' | 'reverb'

export interface AdminSourceStatus {
  source_code: SourceCode
  enabled: boolean
  connected: boolean
  listing_count: number
  updated_at: string | null
}

export interface AdminOverview {
  sources: AdminSourceStatus[]
  summary: {
    total_listings: number
    missing_title: number
    invalid_price: number
    missing_image: number
  }
}

export interface AdminListing {
  id: string
  title: string
  brand: string
  source_code: SourceCode
  price_cents: number | null
  currency: string
  condition: string
  seller_url: string
  image_url: string
}

export interface AdminIssue {
  listing_id: string
  title: string
  source_code: SourceCode
  issue_type: string
  issue_message: string
}
