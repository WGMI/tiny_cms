export interface PageRow {
  id: number;
  slug: string;
  title: string | null;
  full_html: string;
  sections: Section[] | null;
  created_at: string;
  updated_at: string;
}

export type Section =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; content: string }
  | { type: "image"; media_id: number; caption?: string; alt?: string }
  | { type: "columns"; columns: [string, string] | [string, string, string] }
  | { type: "html"; content: string };

/** Public API shape: consumer expects doc.fullHtml */
export interface PagePublic {
  id: number;
  slug: string;
  title: string | null;
  fullHtml: string;
  full_html?: string;
  created_at: string;
  updated_at: string;
}
