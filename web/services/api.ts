import axios from 'axios';
import { ApiBookmark, FetchBookmarksResponse, FetchCategoriesResponse, Category } from '../types/app';

// Axiosインスタンスを作成し、ベースURLとタイムアウトを設定
export const api = axios.create({
  baseURL: 'http://192.168.1.2:8000/', // 実際のAPIのURLに置き換えてください
  timeout: 5000,
});

// ブックマーク取得関数
export const fetchBookmarks = async (categoryId?: number): Promise<FetchBookmarksResponse> => {
  try {
    const url = categoryId ? `/bookmarks/?category_id=${categoryId}` : '/bookmarks/';
    const res = await api.get<FetchBookmarksResponse>(url);
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

// カテゴリ追加用のレスポンス型
export interface AddCategoryResponse {
  category: Category;
}

// カテゴリを追加する関数
export const addCategory = async (name: string): Promise<AddCategoryResponse> => {
  try {
    const res = await api.post<AddCategoryResponse>('/bookmarks/categories', { name });
    return res.data;
  } catch (error) {
    console.error('Failed to add category:', error);
    throw error;
  }
};
