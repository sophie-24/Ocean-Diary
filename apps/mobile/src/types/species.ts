export type Species = {
  id: string;
  slug: string;
  common_name_ko: string;
  scientific_name: string;
  description_ko: string;
  artwork?: { url: string; thumbnail_url: string | null; style_name: string } | null;
};
