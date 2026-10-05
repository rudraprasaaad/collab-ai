export class DocumentPathParser {
  private static readonly PATTERN = /^\/ws\/([A-Za-z0-9_-]+)$/;

  parse(rawUrl: string | undefined): string | null {
    if (!rawUrl) return null;
    const { pathname } = new URL(rawUrl, "http://localhost");
    const match = DocumentPathParser.PATTERN.exec(pathname);

    return match ? match[1] : null;
  }
}
