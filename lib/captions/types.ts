/** What a publisher sees: the post as the backend will hold it. */
export interface CaptionInput {
  title: string;
  subtitle: string;
  body: string;
  /** Strings the backend turns into #hashtags (no leading #). */
  hashtagSource: string[];
  imageUrls: string[];
}

export interface CaptionResult {
  /** Plain text as the platform will display it. */
  text: string;
  /** Character budget applied (undefined = no trimming in the publisher). */
  limit?: number;
  /** True when the publisher cut text to fit. */
  truncated: boolean;
}

/** Python counts code points; JS .length counts UTF-16 units. Match Python. */
export function codePoints(s: string): string[] {
  return Array.from(s);
}

export function cpLength(s: string): number {
  return codePoints(s).length;
}

export function cpSlice(s: string, start: number, end?: number): string {
  return codePoints(s).slice(start, end).join("");
}
