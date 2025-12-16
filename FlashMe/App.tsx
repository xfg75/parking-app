import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome5';

// --- ÉCRANS INDIVIDUELS ---

// Écran d'Inscription
const SignupScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const handleSignup = () => {
    // Logique Supabase pour envoyer le code...
    navigation.navigate('Verify', { phoneNumber: phone });
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>FlashMe</Text>
        <Text style={styles.subtitle}>Ton monde. Tes règles.</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+33</Text>
          <TextInput
            style={styles.input}
            placeholder="6 12 34 56 78"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <TouchableOpacity
          style={[styles.button, phone.length < 9 && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={phone.length < 9}>
          <Text style={styles.buttonText}>Recevoir mon code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Écran de Vérification
const VerificationScreen = ({ route, onLoginSuccess }) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const handleVerify = () => {
    // Logique Supabase pour vérifier le code...
    Alert.alert("Connexion réussie !");
    onLoginSuccess();
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Saisis ton code</Text>
        <Text style={styles.authSubtitle}>Envoyé au +33 {phoneNumber}</Text>
        <TextInput
          style={styles.otpInput}
          placeholder="------"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />
        <TouchableOpacity
          style={[styles.button, otp.length < 6 && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={otp.length < 6}>
          <Text style={styles.buttonText}>Vérifier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Écran Principal (Espace Personnel)
const HomeScreen = () => {
  const galleryItems = [{ id: 1, source: { uri: 'https://placehold.co/300x300/1a202c/ffffff?text=Photo+1' }, isLocked: true }];
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><TouchableOpacity><Icon name="qrcode" size={28} color="#9CA3AF" /></TouchableOpacity></View>
      <View style={styles.mainContent}>
        <View style={styles.slateContainer}><TextInput style={styles.slateInput} placeholder="exprime toi ici" placeholderTextColor="#6B7280" multiline /></View>
        <View style={styles.galleryContainer}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Ma Galerie</Text>
            <TouchableOpacity style={styles.addButton}><Icon name="plus" size={16} color="#FFF" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.galleryGrid}>
            {galleryItems.map(item => (
              <View key={item.id} style={styles.galleryItem}>
                <Image source={item.source} style={styles.galleryImage} />
                {item.isLocked && <View style={styles.lockIconContainer}><Icon name="lock" size={12} color="#FFF" /></View>}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Écran "Flashes" (Contacts et Paramètres)
const FlashesScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.screenContainer}><Text style={styles.screenTitle}>Mes Contacts & Paramètres</Text></View>
  </SafeAreaView>
);

// Écran "Capture" (Appareil Photo)
const CaptureScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.screenContainer}><Text style={styles.screenTitle}>Appareil Photo</Text></View>
  </SafeAreaView>
);

// Écran "Scanner QR Code"
const QRScannerScreen = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>Scanner un QR Code</Text>
        <TouchableOpacity style={{marginTop: 20}} onPress={() => navigation.goBack()}>
            <Text style={{color: '#4F46E5'}}>Fermer</Text>
        </TouchableOpacity>
    </View>
  </SafeAreaView>
);


// --- STRUCTURES DE NAVIGATION ---

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const RootStack = createStackNavigator();

// Navigateur pour l'authentification
const AuthNavigator = ({ onLoginSuccess }) => (
  <NavigationContainer>
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="Verify">
        {props => <VerificationScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  </NavigationContainer>
);

// Navigateur principal avec les onglets
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <MainTab.Screen
      name="FlashesTab"
      component={FlashesScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.footerButtonContainer}>
            <View style={[styles.footerCircleButton, {backgroundColor: focused ? '#22C55E' : '#374151'}]}><Icon name="bolt" size={24} color="#FFF" /></View>
            <Text style={{color: focused ? '#22C55E' : '#9CA3AF', fontSize: 12}}>flashs</Text>
          </View>
        ),
      }}
    />
    <MainTab.Screen
      name="Home"
      component={HomeScreen}
      options={({ navigation }) => ({
        tabBarButton: () => (
          <TouchableOpacity style={styles.flashButton} onPress={() => navigation.navigate('QRScanner')}>
            <Text style={styles.flashButtonText}>Flash</Text>
          </TouchableOpacity>
        ),
      })}
    />
    <MainTab.Screen
      name="CaptureTab"
      component={CaptureScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.footerButtonContainer}>
             <View style={[styles.footerCircleButton, {backgroundColor: focused ? '#EF4444' : '#374151'}]}><Icon name="camera" size={24} color="#FFF" /></View>
            <Text style={{color: focused ? '#EF4444' : '#9CA3AF', fontSize: 12}}>capture</Text>
          </View>
        ),
      }}
    />
  </MainTab.Navigator>
);

// Navigateur Racine qui contient tout
const RootNavigator = () => (
    <RootStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
        <RootStack.Screen name="Main" component={MainNavigator} />
        <RootStack.Screen name="QRScanner" component={QRScannerScreen} />
    </RootStack.Navigator>
);

// --- COMPOSANT PRINCIPAL DE L'APP ---
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthNavigator onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <RootNavigator />
    </NavigationContainer>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111827' },
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: '#111827' },
  title: { fontSize: 60, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginBottom: 48 },
  authTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  authSubtitle: { fontSize: 16, color: '#9CA3AF', marginBottom: 40, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 8, borderWidth: 1, borderColor: '#374151', width: '100%', marginBottom: 24 },
  prefix: { color: '#9CA3AF', fontSize: 18, paddingLeft: 16 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 18, padding: 16 },
  otpInput: { width: '100%', backgroundColor: '#1F2937', borderRadius: 8, borderWidth: 1, borderColor: '#374151', color: '#FFFFFF', fontSize: 24, padding: 16, textAlign: 'center', letterSpacing: 16, marginBottom: 24 },
  button: { width: '100%', backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#374151' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  header: { height: 64, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  mainContent: { flex: 1, flexDirection: 'row', padding: 16, gap: 16 },
  slateContainer: { flex: 2, backgroundColor: '#000', borderRadius: 8, padding: 16 },
  slateInput: { flex: 1, color: '#E5E7EB', fontSize: 18, textAlignVertical: 'top' },
  galleryContainer: { flex: 1, backgroundColor: '#1F2937', borderRadius: 8, padding: 8 },
  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, marginBottom: 8 },
  galleryTitle: { color: '#FFF', fontWeight: '600' },
  addButton: { backgroundColor: '#4F46E5', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryItem: { width: '48%', aspectRatio: 1 },
  galleryImage: { width: '100%', height: '100%', borderRadius: 6 },
  lockIconContainer: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  tabBar: { height: 96, backgroundColor: '#1F2937', borderTopWidth: 0, paddingBottom: 20 },
  footerButtonContainer: { alignItems: 'center', gap: 8, top: 10 },
  footerCircleButton: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  flashButton: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 48, borderWidth: 4, borderColor: '#1F2937' },
  flashButtonText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
});

export default App;
