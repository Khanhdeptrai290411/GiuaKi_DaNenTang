import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../contexts/AuthContext';
import { memberAPI } from '../services/api';

interface Member {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  image?: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { admin, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [])
  );

  React.useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

  const fetchMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      const membersData = Array.isArray(response.data) ? response.data : [];
      setMembers(membersData);
      setFilteredMembers(membersData);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách members');
      console.error('Fetch members error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterMembers = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(
      (member) =>
        member.username.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
    setFilteredMembers(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMembers();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleDelete = (member: Member) => {
    const memberId = member.id || member._id;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${member.username}"?\n\nEmail thông báo sẽ được gửi.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await memberAPI.delete(memberId);
              Alert.alert('Thành công', 'Đã xóa member');
              fetchMembers();
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể xóa member');
            }
          },
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    try {
      if (members.length === 0) {
        Alert.alert('Thông báo', 'Không có dữ liệu để export');
        return;
      }

      // Tạo CSV content
      const csvHeader = 'ID,Username,Email,Has Image\n';
      const csvRows = members.map(member => {
        const id = member.id || member._id || 'N/A';
        const username = member.username || '';
        const email = member.email || '';
        const hasImage = member.image ? 'Yes' : 'No';
        
        // Escape các ký tự đặc biệt trong CSV
        return `"${id}","${username}","${email}","${hasImage}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `members_export_${timestamp}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Ghi file (UTF8 là encoding mặc định)
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Kiểm tra có thể share không
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        // Share file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Members CSV',
          UTI: 'public.comma-separated-values-text',
        });
        
        Alert.alert(
          'Thành công', 
          `Đã export ${members.length} members!\n\nFile: ${fileName}`
        );
      } else {
        Alert.alert(
          'Thành công',
          `File đã được lưu:\n${fileUri}\n\nTổng: ${members.length} members`
        );
      }
      
    } catch (error: any) {
      console.error('Export CSV error:', error);
      Alert.alert('Lỗi', `Không thể export CSV: ${error.message}`);
    }
  };

  const renderRightActions = (item: Member) => {
    const memberId = item.id || item._id;
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.swipeViewButton}
          onPress={() => router.push(`/members/view/${memberId}`)}
        >
          <Text style={styles.swipeButtonText}>👁️ Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.swipeEditButton}
          onPress={() => router.push(`/members/${memberId}`)}
        >
          <Text style={styles.swipeButtonText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.swipeDeleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.swipeButtonText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMember = ({ item }: { item: Member }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        overshootRight={false}
      >
        <View style={styles.memberCard}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.memberAvatar} />
          )}
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.username}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>👋 Xin chào, {admin?.name || 'Admin'}</Text>
          <Text style={styles.subtitle}>Quản lý Members</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Thoát</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm member..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📊 Tổng: <Text style={styles.statsNumber}>{filteredMembers.length}</Text> members
        </Text>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/members/create')}
        >
          <Text style={styles.addButtonText}>+ Thêm Member</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportCSV}
        >
          <Text style={styles.exportButtonText}>📥 Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item, index) => item.id || item._id || `member-${index}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? '🔍 Không tìm thấy kết quả' : '📭 Chưa có member nào'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/members/create')}
                >
                  <Text style={styles.emptyButtonText}>+ Thêm member đầu tiên</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsNumber: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: 16,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    padding: 15,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  swipeActions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  swipeViewButton: {
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  swipeEditButton: {
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeDeleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
