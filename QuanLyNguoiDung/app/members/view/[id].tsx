import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { memberAPI } from '../../../services/api';

interface Member {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  image?: string;
}

export default function ViewMemberScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      const response = await memberAPI.getOne(id as string);
      setMember(response.data);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải thông tin member');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/members/${id}`);
  };

  const handleDelete = async () => {
    if (!member) return;
    
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa member "${member.username}"?\n\nEmail thông báo sẽ được gửi đến: ${member.email}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await memberAPI.delete(id as string);
              Alert.alert('Thành công', 'Đã xóa member và gửi email thông báo', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể xóa member');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy member</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👤 Thông tin Member</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {member.image ? (
          <Image source={{ uri: member.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {member.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Username</Text>
          <Text style={styles.infoValue}>{member.username}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Email</Text>
          <Text style={styles.infoValue}>{member.email}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID</Text>
          <Text style={styles.infoValueSmall}>{member.id || member._id}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editActionButton]}
          onPress={handleEdit}
        >
          <Text style={styles.actionButtonText}>✏️ Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 15,
    paddingBottom: 30,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionButton: {
    backgroundColor: '#f59e0b',
  },
  deleteActionButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

