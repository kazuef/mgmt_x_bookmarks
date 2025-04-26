import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { useBookmarkStore } from '../../store/bookmarkStore';
import SearchBar from '../../components/SearchBar';
import BookmarkList from '../../components/BookmarkList';
import Sidebar from '../../components/Sidebar';
import Colors from '../../constants/colors';
// 新しいインポート
import { fetchBookmarks } from '../../services/api';
import { ApiBookmark, FetchBookmarksResponse } from '../../types/app';

export default function BookmarksScreen() {
  const { isSidebarOpen, toggleSidebar, fetchCategories } = useBookmarkStore();
  // 新しいstate
  const [bookmarksRes, setBookmarksRes] = useState<FetchBookmarksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // APIからのデータ取得
  useEffect(() => {
    const loadBookmarks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBookmarks();
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
    // カテゴリ一覧も取得
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log("data_index", bookmarksRes);
  }, [bookmarksRes]);

  //   以前のコード（参考用）
  //   const [bookmarks, setBookmarks] = useState([]);
  //   useEffect(() => {
  //     const fetchBookmarks = async () => {
  //       try {
  //         const res = await axios.get('http://your-api-url/bookmarks');
  //         setBookmarks(res.data); // データを保存
  //       } catch (err) {
  //         console.error('Failed to fetch bookmarks:', err);
  //       }
  //     };
  //     fetchBookmarks();
  //   }, []);

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
