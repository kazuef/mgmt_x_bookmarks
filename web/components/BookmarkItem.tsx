import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart, Repeat, MessageCircle, BarChart2, MoreHorizontal, Bookmark, CheckCircle } from 'lucide-react-native';
import Colors from '../constants/colors';
import { Bookmark as BookmarkType } from '../mocks/bookmarks';

interface BookmarkItemProps {
  bookmark: BookmarkType;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const BookmarkItem = ({ bookmark }: BookmarkItemProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: bookmark.avatar }} style={styles.avatar} />
        
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.username} numberOfLines={1}>{bookmark.username}</Text>
            {bookmark.isVerified && (
              <CheckCircle size={14} color={Colors.primary} style={styles.verifiedBadge} />
            )}
          </View>
          <Text style={styles.handle}>{bookmark.handle} · {bookmark.date}</Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={18} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.contentText}>{bookmark.content}</Text>
        
        {bookmark.images && bookmark.images.length > 0 && (
          <Image 
            source={{ uri: bookmark.images[0] }} 
            style={styles.contentImage} 
            resizeMode="cover"
          />
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={16} color={Colors.secondary} />
          <Text style={styles.actionText}>{formatNumber(bookmark.replies)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Repeat size={16} color={Colors.secondary} />
          <Text style={styles.actionText}>{formatNumber(bookmark.retweets)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={16} color={Colors.secondary} />
          <Text style={styles.actionText}>{formatNumber(bookmark.likes)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <BarChart2 size={16} color={Colors.secondary} />
          <Text style={styles.actionText}>{formatNumber(bookmark.views)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Bookmark size={16} color={Colors.primary} fill={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  handle: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: Colors.secondary,
    marginLeft: 4,
  },
});

export default BookmarkItem;