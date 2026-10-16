export interface ComponentProps {
  providerId?: string
  componentId?: string
}

export interface ConnectionSaved {
  success: boolean
  component_id?: string
  error?: string
}

export interface DiscoveredAccount {
  id: string
  name: string
  description?: string
  metadata?: {
    org?: { name?: string; domain?: string }
    account_name?: string
    currency?: string
    balance?: string
    balance_at?: string
    holdings_count?: number
  }
}
