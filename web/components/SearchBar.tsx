import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Menu, Search, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { categorizeBookmarks } from '../services/api';
import Colors from '../constants/colors';
import { useBookmarkStore } from '../store/bookmarkStore';

const SearchBar = () => {
  const { searchQuery, setSearchQuery, toggleSidebar } = useBookmarkStore();

  const handleFileAttach = async () => {
    // ドキュメントピッカー起動（JSON のみ）
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    console.log('result:', result);
    
    // キャンセルされた場合は処理を中止
    if (!result.assets || result.assets.length === 0) return;
    
    const file = result.assets[0];
    
    // 拡張子チェック（念のため）
    if (!file.name.endsWith('.json')) {
      alert('JSON ファイルを選択してください');
      return;
    }

    try {
      // ファイル内容を文字列として読み込み
      const content = await FileSystem.readAsStringAsync(file.uri);
      // JSON パースで簡易バリデーション
      JSON.parse(content);

      // FormData 作成
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/json',
      } as any);

      // API 呼び出し
      await categorizeBookmarks(formData);
      alert('ファイルを送信しました');
    } catch (e) {
      console.error(e);
      alert('ファイルの送信に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={toggleSidebar}
        activeOpacity={0.7}
      >
        <Menu size={22} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search bookmarks"
          placeholderTextColor={Colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={handleFileAttach}
        activeOpacity={0.7}
      >
        <Upload size={22} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    backgroundColor: Colors.background,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.extraLightGray,
    borderRadius: 20,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    height: '100%',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
});

export default SearchBar;
