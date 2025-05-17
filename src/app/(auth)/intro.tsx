import { useEffect, useState } from 'react';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntroPage = () => {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const seenIntro = await AsyncStorage.getItem('hasSeenIntro');
        if (seenIntro === 'true') {
          router.replace('/(tabs)');
        } else {
          setHasSeenIntro(false);
        }
      } catch (error) {
        console.error('Error checking intro status:', error);
        setHasSeenIntro(false);
      }
    })();
  }, []);

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving intro status:', error);
      router.replace('/(tabs)'); // Fallback navigation
    }
  };

  if (hasSeenIntro === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={handleDismiss}
          activeOpacity={1}
        />
        <Animated.View
          entering={SlideInDown.duration(500).springify()}
          style={styles.popup}
        >
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeButton}
          >
            <AntDesign name="close" size={22} color="grey" />
          </TouchableOpacity>
          <View style={styles.content}>
            <Text style={styles.title}>Chào mừng đến với Weather App</Text>
            <Text style={styles.description}>
              Khám phá thời tiết hiện tại và dự báo tại vị trí của bạn hoặc bất kỳ thành phố nào trên thế giới. Lưu các thành phố yêu thích và tùy chỉnh cài đặt theo ý thích!
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleDismiss}>
              <Text style={styles.buttonText}>Bắt đầu</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#2A3550',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  closeButton: {
    backgroundColor: 'white',
    height: 26,
    width: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -10,
    right: -10,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default IntroPage;