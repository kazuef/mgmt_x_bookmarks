import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Bookmark, 
  FolderOpen, 
  Filter, 
  Plus, 
  X,
  ChevronRight
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { useBookmarkStore } from '../store/bookmarkStore';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, width * 0.75);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { 
    folders, 
    filters, 
    selectedFolder, 
    selectedFilter,
    selectFolder,
    selectFilter,
    addFilter
  } = useBookmarkStore();
  
  const handleAddFilter = () => {
    // フィルター名の入力を促す
    // Note: promptはウェブ環境では動作しますが、ネイティブ環境では別の実装が必要
    const filterName = prompt('新しいフィルター名を入力してください:');
    if (filterName && filterName.trim() !== '') {
      addFilter(filterName.trim())
        .then(() => {
          // 成功時の処理
          alert(`フィルター「${filterName}」を追加しました`);
        })
        .catch(error => {
          // エラー時の処理
          alert(`フィルターの追加に失敗しました: ${error.message}`);
        });
    }
  };

  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleSelectFolder = (folderId: string) => {
    selectFolder(folderId);
    onClose();
  };

  const handleSelectFilter = (filterId: string) => {
    selectFilter(filterId);
    onClose();
  };

  const handleSelectAll = () => {
    selectFolder(null);
    selectFilter(null);
    onClose();
  };

  if (Platform.OS === 'web' && !isOpen) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        />
      )}
      
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateX }] }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <TouchableOpacity 
            style={[
              styles.menuItem, 
              !selectedFolder && !selectedFilter && styles.selectedMenuItem
            ]} 
            onPress={handleSelectAll}
          >
            <Bookmark size={20} color={!selectedFolder && !selectedFilter ? Colors.primary : Colors.text} />
            <Text style={[
              styles.menuItemText,
              !selectedFolder && !selectedFilter && styles.selectedMenuItemText
            ]}>All Bookmarks</Text>
          </TouchableOpacity>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Filters</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddFilter}>
                <Plus size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {filters.map(filter => (
              <TouchableOpacity 
                key={filter.id}
                style={[
                  styles.menuItem, 
                  selectedFilter === filter.id && styles.selectedMenuItem
                ]} 
                onPress={() => handleSelectFilter(filter.id)}
              >
                <Filter size={20} color={selectedFilter === filter.id ? Colors.primary : Colors.text} />
                <Text style={[
                  styles.menuItemText,
                  selectedFilter === filter.id && styles.selectedMenuItemText
                ]}>{filter.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Folders</Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {folders.map(folder => (
              <TouchableOpacity 
                key={folder.id}
                style={[
                  styles.menuItem, 
                  selectedFolder === folder.id && styles.selectedMenuItem
                ]} 
                onPress={() => handleSelectFolder(folder.id)}
              >
                <FolderOpen size={20} color={selectedFolder === folder.id ? Colors.primary : Colors.text} />
                <Text style={[
                  styles.menuItemText,
                  selectedFolder === folder.id && styles.selectedMenuItemText
                ]}>{folder.name}</Text>
                <ChevronRight size={16} color={Colors.secondary} style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: Colors.background,
    zIndex: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  selectedMenuItem: {
    backgroundColor: Colors.extraLightGray,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: Colors.text,
  },
  selectedMenuItemText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  addButton: {
    padding: 4,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default Sidebar;
