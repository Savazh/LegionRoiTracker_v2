export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: string;
          nickname: string;
          token_id: string;
          content: string;
          created_at: string;
          votes: number;
        };
        Insert: {
          id?: string;
          nickname: string;
          token_id: string;
          content: string;
          created_at?: string;
          votes?: number;
        };
        Update: {
          id?: string;
          nickname?: string;
          token_id?: string;
          content?: string;
          created_at?: string;
          votes?: number;
        };
      };
      price_predictions: {
        Row: {
          id: string;
          nickname: string;
          token_id: string;
          predicted_price: number;
          target_date: string;
          created_at: string;
          votes: number;
        };
        Insert: {
          id?: string;
          nickname: string;
          token_id: string;
          predicted_price: number;
          target_date: string;
          created_at?: string;
          votes?: number;
        };
        Update: {
          id?: string;
          nickname?: string;
          token_id?: string;
          predicted_price?: number;
          target_date?: string;
          created_at?: string;
          votes?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}