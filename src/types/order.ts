
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  combo_id?: string;
  quantity: number;
  price: number;
  is_rental: boolean;
  rental_start_date?: string;
  rental_end_date?: string;
  product?: {
    id: string;
    name: string;
  };
  product_images?: {
    image_url: string;
  }[];
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  coupon_discount?: number;
  installments?: number;
  status: string;
  payment_status?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  rental_start_date?: string;
  rental_end_date?: string;
  rental_pickup_preference?: string;
  customer_notes?: string;
  items?: OrderItem[];
}
