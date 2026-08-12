type Config = {
  baseURL: string;
  siteTitle: string;
  siteDescription: string;
  siteImage: string;
  highlightStyle: string;
  compileTs: boolean;
  // Opt-in: build non-index.md markdown pages into a directory so each page is
  // served at a clean directory URL (content/faq.md -> output/faq/index.html -> /faq/)
  directoryIndex?: boolean;
}

export default Config;
