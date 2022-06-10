export type FileCache = {
  timestamp: number;
};

export default {
  withStamp(url: string, stamps: Record<string, FileCache>): string {
    const [uri, query] = url.split('?');
    const t = (stamps[uri] || stamps[uri + '.ts'] || stamps[uri + '.js'] || { timestamp: 0 }).timestamp;
    return [uri].concat([(query?.split('&') || []).concat(`t=${t}`).join('&')]).join('?');
  },
  findStamp(url: string, stamps: Record<string, FileCache>): number {
    const [uri] = url.split('?');
    return (stamps[uri] || stamps[uri + '.ts'] || stamps[uri + '.js'] || { timestamp: 0 }).timestamp;
  }
};
