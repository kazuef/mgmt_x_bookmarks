import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Menu, Search, SlidersHorizontal } from 'lucide-react-native';
import Colors from '../constants/colors';
import { useBookmarkStore } from '../store/bookmarkStore';

const SearchBar = () => {
  const { searchQuery, setSearchQuery, toggleSidebar } = useBookmarkStore();

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
        activeOpacity={0.7}
      >
        <SlidersHorizontal size={22} color={Colors.text} />
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