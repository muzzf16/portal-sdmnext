export interface ChangelogEntry {
  id?: number;
  release_tag: string;
  module: string;
  type: 'feature' | 'fix' | 'improvement' | 'refactor';
  description: string;
  impacted_files: string[];
  released_at?: string;
  created_by?: string;
}
