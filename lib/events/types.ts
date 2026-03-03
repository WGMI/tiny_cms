export interface Media {
  id: number;
  path: string;
  filename: string | null;
  mime_type: string | null;
  created_at: string;
}

export interface EventRow {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  image_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface EventPublic {
  id: number;
  title: string;
  description: string | null;
  date: string;
  event_date: string;
  location: string | null;
  image?: { url: string };
  image_id?: number;
  created_at: string;
  updated_at: string;
}

export interface EventsPageRow {
  id: number;
  title: string | null;
  subtitle: string | null;
  updated_at: string | null;
}
