import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'; // Module pour le GPS

export default function App() {
  // ---------------------------------------------------------
  // ⚠️ IMPORTANT : REMPLACEZ PAR VOTRE ADRESSE IP LOCALE
  // ---------------------------------------------------------
  const IP_ADRESS = "192.168.0.27"; 
  const API_URL = `http://${IP_ADRESS}:8000`;

  const [parkings, setParkings] = useState([]);
  
  // Position par défaut de la caméra (Paris centre)
  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // --- 1. RÉCUPÉRER LES PLACES (GET) ---
  const fetchParkings = async () => {
    try {
      console.log("Mise à jour de la carte...");
      const response = await fetch(`${API_URL}/parkings`);
      const data = await response.json();
      setParkings(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur Réseau", "Vérifiez l'IP et que le serveur Python tourne bien !");
    }
  };

  // --- 2. SIGNALER MA POSITION (POST avec GPS) ---
  const reportParking = async () => {
    try {
      // A. Demander la permission d'utiliser le GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Erreur", "L'accès au GPS est refusé. Allez dans les réglages.");
        return;
      }

      console.log("Acquisition de la position GPS...");
      
      // B. Obtenir la position précise
      let location = await Location.getCurrentPositionAsync({});
      console.log("Position trouvée :", location.coords);

      // C. Préparer les données
      const newPlace = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        message: "Signalé via GPS réel 🎯",
        status: "libre",
        created_at: new Date().toLocaleTimeString()
      };

      // D. Envoyer au serveur
      const response = await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      if (response.ok) {
        Alert.alert("Succès", "Votre position a été partagée !");
        fetchParkings(); // On rafraîchit la carte immédiatement
      }

    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible d'envoyer la position au serveur.");
    }
  };

  // Charger les places au lancement de l'appli
  useEffect(() => {
    fetchParkings();
  }, []);

  return (
    <View style={styles.container}>
      {/* LA CARTE */}
      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
        showsUserLocation={true} // Affiche le petit point bleu "Vous êtes ici"
      >
        {/* Affichage des marqueurs */}
        {parkings.map((spot) => (
          <Marker
            // On sécurise la clé (ID ou aléatoire si bug)
            key={spot.id ? spot.id.toString() : Math.random().toString()}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={`Place #${spot.id}`}
            description={`${spot.message} (${spot.created_at})`}
            pinColor={spot.status === "libre" ? "green" : "red"}
          />
        ))}
      </MapView>

      {/* BOUTONS D'ACTION */}
      <View style={styles.buttonsContainer}>
        {/* Bouton Rafraîchir */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchParkings}>
          <Text style={styles.btnIcon}>🔄</Text>
        </TouchableOpacity>

        {/* Bouton Signaler */}
        <TouchableOpacity style={styles.reportButton} onPress={reportParking}>
          <Text style={styles.btnMainText}>P</Text>
          <Text style={styles.btnSubText}>Je libère</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Aligne les boutons en bas
  },
  refreshButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  reportButton: {
    backgroundColor: '#3498db', // Bleu parking
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#3498db',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: 'white'
  },
  btnIcon: {
    fontSize: 24,
  },
  btnMainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  btnSubText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -5,
  }
});