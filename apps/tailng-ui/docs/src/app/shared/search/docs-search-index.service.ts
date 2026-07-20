import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type Fuse from 'fuse.js';
import { firstValueFrom } from 'rxjs';

export type DocsSearchEntry = Readonly<{
  title: string;
  url: string;
  description?: string;
  section?: string;
  tags?: readonly string[];
  content?: string;
}>;

export type DocsSearchIndex = Readonly<{
  entries: readonly DocsSearchEntry[];
  fuse: Fuse<DocsSearchEntry>;
}>;

@Injectable({ providedIn: 'root' })
export class DocsSearchIndexService {
  private readonly http = inject(HttpClient);
  private indexPromise: Promise<DocsSearchIndex> | undefined;

  public load(): Promise<DocsSearchIndex> {
    this.indexPromise ??= Promise.all([
      firstValueFrom(this.http.get<readonly DocsSearchEntry[]>('/search/index.json')),
      import('fuse.js'),
    ]).then(
      ([entries, { default: fuseConstructor }]): DocsSearchIndex => ({
        entries,
        fuse: new fuseConstructor(entries, {
          includeScore: false,
          ignoreLocation: true,
          threshold: 0.4,
          keys: [
            { name: 'title', weight: 2 },
            { name: 'tags', weight: 1.5 },
            { name: 'section', weight: 1.2 },
            { name: 'description', weight: 1 },
            { name: 'content', weight: 0.5 },
          ],
        }),
      }),
    );

    return this.indexPromise;
  }
}
