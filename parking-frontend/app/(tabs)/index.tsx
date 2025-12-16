import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  // ---------------------------------------------------------
  // ⚠️ GARDEZ VOTRE IP (J'ai remis la vôtre ici)
  // ---------------------------------------------------------
  const IP_ADRESS = "192.168.0.27"; 
  const API_URL = `http://${IP_ADRESS}:8000`;

  const [parkings, setParkings] = useState([]);

  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // --- 1. RÉCUPÉRER LES PLACES (GET) ---
  const fetchParkings = async () => {
    try {
      const response = await fetch(`${API_URL}/parkings`);
      const data = await response.json();
      setParkings(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de joindre le serveur Python.");
    }
  };

  // --- 2. SIGNALER UNE PLACE (POST + GPS) ---
  const reportParking = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Erreur", "Permission GPS refusée.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      const newPlace = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        message: "Libre (GPS)",
        status: "libre",
        created_at: new Date().toLocaleTimeString()
      };

      await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      Alert.alert("Merci !", "Votre place a été partagée.");
      fetchParkings(); 

    } catch (error) {
      Alert.alert("Erreur", "Échec de l'envoi.");
    }
  };

  // --- 3. PRENDRE UNE PLACE (DELETE) --- 
  // (C'EST CE BLOC QUI MANQUAIT DANS VOTRE VERSION)
  const takePlace = (id) => {
    Alert.alert(
      "Se garer ici ?",
      "Confirmez-vous avoir pris cette place ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, je la prends", 
          onPress: async () => {
            try {
              // On appelle la route DELETE du serveur Python
              await fetch(`${API_URL}/parkings/${id}`, { method: 'DELETE' });
              Alert.alert("Parfait", "La place a été retirée de la carte.");
              fetchParkings(); // Mise à jour immédiate
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer la place.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
        showsUserLocation={true} 
      >
        {parkings.map((spot) => (
          <Marker
            key={spot.id ? spot.id.toString() : Math.random().toString()}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={`Place #${spot.id}`}
            description={"Appuyez ici pour vous garer"} 
            pinColor={spot.status === "libre" ? "green" : "red"}
            
            // C'EST L'AUTRE LIGNE QUI MANQUAIT :
            // Déclenche la fonction takePlace quand on clique sur la bulle
            onCalloutPress={() => takePlace(spot.id)}
          />
        ))}
      </MapView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchParkings}>
          <Text style={styles.btnIcon}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={reportParking}>
          <Text style={styles.btnMainText}>P</Text>
          <Text style={styles.btnSubText}>Je libère</Text>
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
  refreshButton: {
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