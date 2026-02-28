export type AgeGroup = '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type NycFamiliarity = 'never_been' | 'visited' | 'live_here';
export type SortMode = 'hot' | 'new' | 'top';
export type SubredditType = 'borough' | 'category';

export interface User {
  id: string;
  username: string;
  age_group: AgeGroup;
  country: string;
  nyc_familiarity: NycFamiliarity;
  created_at: string;
}

export interface UserDemographics {
  user_id: string;
  username: string;
  age_group: AgeGroup;
  country: string;
  nyc_familiarity: NycFamiliarity;
}

export interface Subreddit {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  color: string;
  emoji: string;
  type: SubredditType;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  subreddit_id: string;
  author_id: string;
  created_at: string;
}

export interface PostWithDetails extends Post {
  author_username: string;
  subreddit_name: string;
  subreddit_display_name: string;
  subreddit_color: string;
  subreddit_emoji: string;
  vote_count: number;
  comment_count: number;
  user_vote: number | null;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  author_id: string;
  created_at: string;
}

export interface CommentWithDetails extends Comment {
  author_username: string;
  vote_count: number;
  user_vote: number | null;
  replies?: CommentWithDetails[];
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  value: number;
  created_at: string;
}

export interface AuthToken {
  user_id: string;
  username: string;
  exp: number;
}

export const AGE_GROUPS: AgeGroup[] = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

export const NYC_FAMILIARITY_OPTIONS: { value: NycFamiliarity; label: string }[] = [
  { value: 'never_been', label: 'Never been' },
  { value: 'visited', label: 'Visited' },
  { value: 'live_here', label: 'I live here' },
];
