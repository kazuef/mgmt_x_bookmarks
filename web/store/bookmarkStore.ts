import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookmarks as initialBookmarks, Bookmark, folders as initialFolders, filters as initialFilters } from '../mocks/bookmarks';
import { Category } from '../types/app';
import { fetchCategories as apiFetchCategories, addCategory as apiAddCategory, fetchBookmarks } from '../services/api';
import { FetchBookmarksResponse } from '../types/app';

interface Folder {
  id: string;
  name: string;
}

interface Filter {
  id: string;
  name: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  folders: Folder[];
  filters: Filter[];
  categories: Category[];
  selectedFolder: string | null;
  selectedFilter: string | null;
  searchQuery: string;
  isSidebarOpen: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  selectFolder: (folderId: string | null) => void;
  selectFilter: (filterId: string | null) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  addFolder: (name: string) => void;
  removeFolder: (folderId: string) => void;
  addBookmarkToFolder: (bookmarkId: string, folderId: string) => void;
  removeBookmarkFromFolder: (bookmarkId: string, folderId: string) => void;
  setCategories: (cats: Category[]) => void;
  fetchCategories: () => Promise<void>;
  addFilter: (name: string) => Promise<void>;
  fetchBookmarksByFilter: (filterId: string | null) => Promise<FetchBookmarksResponse>;
  
  // Computed
  filteredBookmarks: () => Bookmark[];
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: initialBookmarks,
      folders: initialFolders,
      filters: initialFilters,
      categories: [],
      selectedFolder: null,
      selectedFilter: null,
      searchQuery: '',
      isSidebarOpen: false,
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      selectFolder: (folderId) => set({ 
        selectedFolder: folderId, 
        selectedFilter: null 
      }),
      
      selectFilter: (filterId) => set({ 
        selectedFilter: filterId, 
        selectedFolder: null 
      }),
      
      setCategories: (cats) => set({ categories: cats }),
      
      fetchCategories: async () => {
        try {
          const { categories } = await apiFetchCategories();
          set({ categories });
          // ストア内の filters を動的に置き換え
          set({ filters: categories.map(c => ({ id: c.id.toString(), name: c.name })) });
        } catch (e) {
          console.error('カテゴリ取得失敗:', e);
        }
      },
      
      addBookmark: (bookmark) => set((state) => ({ 
        bookmarks: [...state.bookmarks, bookmark] 
      })),
      
      removeBookmark: (bookmarkId) => set((state) => ({ 
        bookmarks: state.bookmarks.filter(b => b.id !== bookmarkId) 
      })),
      
      addFolder: (name) => set((state) => ({ 
        folders: [...state.folders, { 
          id: Date.now().toString(), 
          name 
        }] 
      })),
      
      removeFolder: (folderId) => set((state) => ({ 
        folders: state.folders.filter(f => f.id !== folderId),
        selectedFolder: state.selectedFolder === folderId ? null : state.selectedFolder,
        bookmarks: state.bookmarks.map(bookmark => ({
          ...bookmark,
          folders: bookmark.folders?.filter(id => id !== folderId)
        }))
      })),
      
      addBookmarkToFolder: (bookmarkId, folderId) => set((state) => ({
        bookmarks: state.bookmarks.map(bookmark => 
          bookmark.id === bookmarkId 
            ? { 
                ...bookmark, 
                folders: [...(bookmark.folders || []), folderId] 
              }
            : bookmark
        )
      })),
      
      removeBookmarkFromFolder: (bookmarkId, folderId) => set((state) => ({
        bookmarks: state.bookmarks.map(bookmark => 
          bookmark.id === bookmarkId 
            ? { 
                ...bookmark, 
                folders: bookmark.folders?.filter(id => id !== folderId) 
              }
            : bookmark
        )
      })),
      
      addFilter: async (name) => {
        try {
          // APIを呼び出してカテゴリを追加
          const { category } = await apiAddCategory(name);
          // 成功したらストアのfiltersを更新
          set((state) => ({ 
            filters: [...state.filters, { 
              id: category.id.toString(), 
              name: category.name 
            }] 
          }));
        } catch (e) {
          console.error('フィルター追加失敗:', e);
          throw e;
        }
      },
      
      fetchBookmarksByFilter: async (filterId) => {
        try {
          // filtersから選択されたフィルターに対応するカテゴリIDを取得
          let categoryId: number | undefined = undefined;
          if (filterId) {
            categoryId = parseInt(filterId);
          }
          
          // APIからデータを取得
          const response = await fetchBookmarks(categoryId);
          return response;
        } catch (e) {
          console.error('ブックマーク取得失敗:', e);
          throw e;
        }
      },
      
      filteredBookmarks: () => {
        const { bookmarks, selectedFolder, selectedFilter, searchQuery } = get();
        
        return bookmarks.filter(bookmark => {
          // Filter by folder
          if (selectedFolder && (!bookmark.folders || !bookmark.folders.includes(selectedFolder))) {
            return false;
          }
          
          // Filter by filter type
          if (selectedFilter) {
            const filter = get().filters.find(f => f.id === selectedFilter);
            if (filter) {
              switch (filter.name) {
                case 'Media':
                  if (!bookmark.images || bookmark.images.length === 0) return false;
                  break;
                case 'Links':
                  if (!bookmark.content.includes('http')) return false;
                  break;
                case 'Mentions':
                  if (!bookmark.content.includes('@')) return false;
                  break;
                case 'Verified':
                  if (!bookmark.isVerified) return false;
                  break;
              }
            }
          }
          
          // Filter by search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
              bookmark.content.toLowerCase().includes(query) ||
              bookmark.username.toLowerCase().includes(query) ||
              bookmark.handle.toLowerCase().includes(query)
            );
          }
          
          return true;
        });
      }
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
