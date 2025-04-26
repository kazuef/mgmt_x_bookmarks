import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookmarks as initialBookmarks, Bookmark, folders as initialFolders, filters as initialFilters } from '../mocks/bookmarks';

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
  
  // Computed
  filteredBookmarks: () => Bookmark[];
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: initialBookmarks,
      folders: initialFolders,
      filters: initialFilters,
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