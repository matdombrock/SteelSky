// The metadata found on the page
export type FrontMatter = {
  title: string;
  description: string;
  image: string;
  date: string;
}

// The full metadata used by steelsky
export type PageMeta = FrontMatter & {
  path: string;
  ext: string;
}
