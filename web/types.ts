// 既存のインターフェースはmocks/bookmarks.tsに定義されているため、
// APIからのデータ用に新しいインターフェースを定義します
export interface Bookmark {
  displayName: string;
  userId: string;
  content: string;
  category: string;
}

// X（旧Twitter）のAPI用の型定義
export interface Tweet {
  profile_image_url_https: string;
  screen_name: string;
  name: string;
  full_text?: string;
  note_tweet_text?: string;
  tweeted_at: string;           // ISO 8601 形式
  extended_media?: Array<{
    media_url_https: string;
  }>;
  tweet_url: string;
}

export interface ApiBookmark {
  id: string;
  category: string;
  created_at: string;           // 取得日時
  tweet: Tweet;
}

// レスポンス全体の型定義
export interface FetchBookmarksResponse {
  bookmarks: ApiBookmark[];
}
