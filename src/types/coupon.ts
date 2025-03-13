
export interface Coupon {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount?: number;
  max_uses?: number;
  current_uses?: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
