// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthScreen from './src/screens/AuthScreen';
import AppNavigator from './src/navigation';
import { getUser, User } from './src/storage';
import { Colors } from './src/theme';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await getUser();
      setUser(saved);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        {user ? (
          <AppNavigator user={user} onLogout={() => setUser(null)} />
        ) : (
          <AuthScreen onAuth={setUser} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
