import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { useBookmarkStore } from '../../store/bookmarkStore';
import SearchBar from '../../components/SearchBar';
import BookmarkList from '../../components/BookmarkList';
import Sidebar from '../../components/Sidebar';
import Colors from '../../constants/colors';
import { FetchBookmarksResponse } from '../../types/app';

export default function BookmarksScreen() {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    fetchCategories, 
    selectedFilter,
    fetchBookmarksByFilter 
  } = useBookmarkStore();
  
  // 新しいstate
  const [bookmarksRes, setBookmarksRes] = useState<FetchBookmarksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // APIからのデータ取得 - フィルター変更時にも再取得
  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBookmarksByFilter(selectedFilter);
        console.log('Fetched bookmarks:', data);
        setBookmarksRes(data);
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err);
        setError('ブックマークの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
    // カテゴリ一覧も取得（初回のみ）
  }, [fetchBookmarksByFilter, selectedFilter]);

  // カテゴリ一覧の取得は別のuseEffectで行う
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log("data_index", bookmarksRes);
  }, [bookmarksRes]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
      />
      
      <View style={styles.content}>
        <SearchBar />
        <BookmarkList data={bookmarksRes} isLoading={isLoading} error={error} />
      </View>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={toggleSidebar} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
