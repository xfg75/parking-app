import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions, Linking, Platform, ToastAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  // ---------------------------------------------------------
  // ⚠️ IP FIXÉE À .30
  // ---------------------------------------------------------
  const IP_ADRESS = "192.168.0.30"; 
  const API_URL = `http://${IP_ADRESS}:8000`;

  const mapRef = useRef(null); 
  const [parkings, setParkings] = useState([]);

  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const centerOnUser = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(userRegion, 1000);
    } catch (error) {
      // Silence
    }
  };

  const fetchParkings = async () => {
    try {
      const response = await fetch(`${API_URL}/parkings`);
      const data = await response.json();
      setParkings(data);
    } catch (error) {
      // Silence
    }
  };

  const sendSpot = async (typeMessage) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Erreur", "GPS refusé.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      const newPlace = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        message: typeMessage,
        status: "libre",
        created_at: new Date().toLocaleTimeString()
      };

      await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      // Ici on garde l'alerte pour remercier, mais on pourrait aussi mettre un Toast
      Alert.alert("Merci !", "La communauté vous remercie.");
      fetchParkings(); 
      centerOnUser();

    } catch (error) {
      Alert.alert("Erreur", "Échec de l'envoi.");
    }
  };

  const handleReportPress = () => {
    Alert.alert(
      "Signaler une place",
      "Quelle est la situation ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "👀 J'ai vu une place", onPress: () => sendSpot("Vue par piéton 👀") },
        { text: "🚗 Je libère ma place", onPress: () => sendSpot("Libérée par conducteur 🚗") }
      ]
    );
  };

  // --- LE MENU MODIFIÉ ---
  const takePlace = (id, lat, long, message) => {
    Alert.alert(
      message, 
      "Action rapide :",
      [
        // 3. FAUSSE - EN BAS (Destructif)
        { 
          text: "❌ Fausse/Occupée", 
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/parkings/${id}`, { method: 'DELETE' });
              
              // Feedback NON BLOQUANT
              if (Platform.OS === 'android') {
                ToastAndroid.show("Place supprimée.", ToastAndroid.SHORT);
              }
              
              fetchParkings();
            } catch (error) {
              Alert.alert("Erreur", "Problème réseau.");
            }
          }
        },
        // 2. JE ME GARE - AU MILIEU
        { 
          text: "✅ Garé !", 
          onPress: async () => {
            try {
              await fetch(`${API_URL}/parkings/${id}`, { method: 'DELETE' });
              
              // Feedback NON BLOQUANT
              if (Platform.OS === 'android') {
                ToastAndroid.show("Super ! Bon stationnement.", ToastAndroid.SHORT);
              }
              // Sur iOS rien ne se passe, la place disparaît juste.
              
              fetchParkings();
            } catch (error) {
              Alert.alert("Erreur", "Problème réseau.");
            }
          }
        },
        // 1. GPS (GO !) - EN PREMIER
        { 
          text: "🗺️ GO !", 
          onPress: () => {
            // URL standard Google Maps universelle
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
            Linking.openURL(url);
          }
        }
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    fetchParkings();
    const timer = setInterval(() => fetchParkings(), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map} 
        initialRegion={initialRegion}
        showsUserLocation={true} 
      >
        {parkings.map((spot) => (
          <Marker
            key={spot.id ? spot.id.toString() : Math.random().toString()}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            pinColor={spot.status === "libre" ? "green" : "red"}
            onPress={() => takePlace(spot.id, spot.latitude, spot.longitude, spot.message)}
          />
        ))}
      </MapView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
          <Text style={styles.btnIcon}>🎯</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={handleReportPress}>
          <Text style={styles.btnMainText}>P</Text>
          <Text style={styles.btnSubText}>Signaler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  buttonsContainer: {
    position: 'absolute', bottom: 50, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  centerButton: {
    backgroundColor: 'white', width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
  },
  reportButton: {
    backgroundColor: '#3498db', width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center', elevation: 10,
    shadowColor: '#3498db', shadowOpacity: 0.5, shadowRadius: 10,
    borderWidth: 4, borderColor: 'white'
  },
  btnIcon: { fontSize: 24 },
  btnMainText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  btnSubText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: -5 }
});