import axios from 'axios';
import { ApiBookmark, FetchBookmarksResponse, FetchCategoriesResponse } from '../types/app';

// Axiosインスタンスを作成し、ベースURLとタイムアウトを設定
export const api = axios.create({
  baseURL: 'http://192.168.1.2:8000/', // 実際のAPIのURLに置き換えてください
  timeout: 5000,
});

// ブックマーク取得関数
export const fetchBookmarks = async (): Promise<FetchBookmarksResponse> => {
  try {
    const res = await api.get<FetchBookmarksResponse>('/bookmarks/');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    throw error;
  }
};

// カテゴリ取得関数
export const fetchCategories = async (): Promise<FetchCategoriesResponse> => {
  const res = await api.get<FetchCategoriesResponse>('/bookmarks/categories');
  return res.data;
};
