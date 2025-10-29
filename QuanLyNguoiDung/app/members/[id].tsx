import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { memberAPI } from '../../services/api';

export default function EditMemberScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      console.log('Fetching member with ID:', id);
      const response = await memberAPI.getOne(id as string);
      console.log('Member response:', response.data);
      
      // Backend trả về trực tiếp object member, không có wrapper
      const member = response.data;
      
      if (!member || (!member._id && !member.id)) {
        throw new Error('Invalid member data');
      }
      
      setUsername(member.username || '');
      setEmail(member.email || '');
      setImage(member.image || '');
    } catch (error: any) {
      console.error('Fetch member error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Không thể tải thông tin member';
      Alert.alert('Lỗi', errorMsg);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleUpdate = async () => {
    if (!username || !email) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setSaving(true);
    try {
      const data: any = { username, email };
      if (password) {
        data.password = password;
      }
      if (image) {
        data.image = image;
      }

      const response = await memberAPI.update(id as string, data);

      if (response.data.success || response.data.member) {
        Alert.alert(
          'Thành công',
          `Đã cập nhật member "${username}"!\n\nEmail thông báo đã được gửi đến: ${email}`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không thể cập nhật member');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.email?.[0] || 'Có lỗi xảy ra';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>✏️ Sửa Member</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Ảnh đại diện (tùy chọn)</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
            disabled={saving}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderSubtext}>Chọn ảnh</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập username"
            value={username}
            onChangeText={setUsername}
            editable={!saving}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!saving}
          />

          <Text style={styles.label}>Mật khẩu mới (tùy chọn)</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Để trống nếu không đổi mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!saving}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              📧 Sau khi cập nhật, email thông báo sẽ được gửi đến member.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Đang lưu...' : 'Cập nhật Member'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
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
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  noteBox: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    color: '#92400e',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f59e0b',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 40,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 5,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: 'white',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

