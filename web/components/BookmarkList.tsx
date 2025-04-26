import React from 'react';
import { StyleSheet, FlatList, View, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useBookmarkStore } from '../store/bookmarkStore';
import BookmarkItem from './BookmarkItem';
import Colors from '../constants/colors';
import { ApiBookmark, FetchBookmarksResponse } from '../types';
import { Linking } from 'react-native';

interface BookmarkListProps {
  data?: FetchBookmarksResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

const BookmarkList = ({ data, isLoading, error }: BookmarkListProps) => {
  // 既存のZustandデータ取得
  const { filteredBookmarks, selectedFolder, selectedFilter, filters, folders } = useBookmarkStore();
  const storeBookmarks = filteredBookmarks();
  console.log("data_bookmark_list: ", data);
  // APIデータがある場合はそれを優先して表示
  const showApiData = data && data.bookmarks && data.bookmarks.length > 0;
  console.log("showApiData: ", showApiData);

  const getTitle = () => {
    if (selectedFolder) {
      const folder = folders.find(f => f.id === selectedFolder);
      return folder ? folder.name : 'Bookmarks';
    }
    
    if (selectedFilter) {
      const filter = filters.find(f => f.id === selectedFilter);
      return filter ? `${filter.name} Bookmarks` : 'Bookmarks';
    }
    
    return 'All Bookmarks';
  };

  // API用のレンダリング関数
  const renderApiBookmark = ({ item }: { item: ApiBookmark }) => {
    const tweet = item.tweet;
    
    // 日付フォーマット（例：4月22日 13:28）
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}月${day}日 ${hours}:${minutes}`;
    };
    
    const formattedDate = formatDate(tweet.tweeted_at);
    
    return (
      <View style={styles.card}>
        <View style={styles.tweetHeader}>
          <Image 
            source={{ uri: tweet.profile_image_url_https }} 
            style={styles.avatar} 
          />
          
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.displayName}>{tweet.name}</Text>
            </View>
            <Text style={styles.userId}>@{tweet.screen_name} · {formattedDate}</Text>
          </View>
        </View>
        
        <Text style={styles.content}>
          {tweet.full_text || tweet.note_tweet_text}
        </Text>
        
        {tweet.extended_media && tweet.extended_media.length > 0 && (
          <Image 
            source={{ uri: tweet.extended_media[0].media_url_https }} 
            style={styles.mediaImage} 
            resizeMode="cover"
          />
        )}
        
        <View style={styles.footer}>
          <Text style={styles.category}>{item.category}</Text>
          
          <TouchableOpacity 
            onPress={() => Linking.openURL(tweet.tweet_url)}
            style={styles.tweetLinkContainer}
          >
            <Text style={styles.tweetLink}>投稿を表示</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ローディング表示
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>ブックマークを読み込み中...</Text>
    </View>
  );

  // エラー表示
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No bookmarks found</Text>
      <Text style={styles.emptyText}>
        Bookmarks you add will appear here
      </Text>
    </View>
  );

  // メインのレンダリング
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
      </View>
      
      {/* ローディング中表示 */}
      {isLoading && renderLoading()}
      
      {/* エラー表示 */}
      {error && renderError()}
      
      {/* データ表示（ローディング中でもエラーでもない場合） */}
      {!isLoading && !error && (
        showApiData ? (
          // APIデータ表示
          <FlatList
            data={data?.bookmarks}
            keyExtractor={(item) => item.id}
            renderItem={renderApiBookmark}
            contentContainerStyle={styles.list}
            ListEmptyComponent={renderEmptyList}
          />
        ) : (
          // Zustandデータ表示（既存の処理）
          <FlatList
            data={storeBookmarks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BookmarkItem bookmark={item} />}
            contentContainerStyle={storeBookmarks.length === 0 ? { flex: 1 } : {}}
            ListEmptyComponent={renderEmptyList}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  // X風カード用のスタイル
  card: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userId: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 2,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.extraLightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
  },
  tweetLinkContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tweetLink: {
    fontSize: 12,
    color: Colors.primary,
  },
  // ローディングとエラー用のスタイル
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
  },
});

export default BookmarkList;
