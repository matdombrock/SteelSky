import fs from 'fs';

class Config {
  sourcePath: string = './';
  layoutPath: string = './';
  highlightStyle: string = './';
  outPath: string = './build/';
  rssTitle: string = 'SteelSky Site';
  rssURL: string = 'http://example.com';
  rssDescription: string = 'A static site generated with SteelSky.';

  // Loads config file
  constructor() {
    this.load();
  }
  // Allows reloading
  public load() {
    if (!fs.existsSync('./sscfg.json')) {
      console.log('Error: Missing config: ./sscfg.json');
      process.exit();
    }
    const cfgRaw: string = fs.readFileSync('./sscfg.json', 'utf-8');
    const parsed: any = JSON.parse(cfgRaw);
    this.sourcePath = parsed.sourcePath;
    this.layoutPath = parsed.layoutPath;
    this.highlightStyle = parsed.highlightStyle;
    this.outPath = parsed.outPath;
    this.rssTitle = parsed.rssTitle;
    this.rssURL = parsed.rssURL;
    this.rssDescription = parsed.rssDescription;
    console.log('Config loaded.');
    console.log(this);
  }
}
export default Config;
