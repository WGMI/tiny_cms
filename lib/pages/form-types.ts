export interface AboutPerson {
  name?: string;
  bio?: string;
  image_id?: number | null;
}

export interface AboutSocial {
  platform?: string;
  url: string;
}

export interface PageFormData {
  title?: string;
  description?: string;
  mission?: string;
  vision?: string;
  policies?: string;
  education?: string;
  background?: string;
  objectives?: string[];
  people?: AboutPerson[];
  socials?: AboutSocial[];
}
