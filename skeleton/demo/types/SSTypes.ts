// This is a copy from the SteelSky source

// The metadata found on the page
type FrontMatter = {
  title: string;
  description: string;
  image: string;
  date: string;
}

// The full metadata used by steelsky
type PageMeta = FrontMatter & {
  path: string;
  ext: string;
}

export type { FrontMatter, PageMeta };
