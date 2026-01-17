import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions, Linking, Platform, ToastAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // ---------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------
  const IP_ADRESS = "192.168.0.30"; // Tu changeras ça quand tu auras ton VPS
  const API_URL = "https://api.charbo.pro";

  const mapRef = useRef(null); 
  const [parkings, setParkings] = useState([]);
  const [myCar, setMyCar] = useState(null); 

  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // ---------------------------------------------------------
  // INITIALISATION
  // ---------------------------------------------------------
  useEffect(() => {
    checkBetaMessage(); // 1. On vérifie le message d'accueil
    checkSavedCar();    // 2. On vérifie la voiture
    fetchParkings();    // 3. On charge les places
    
    const timer = setInterval(() => fetchParkings(), 5000);
    return () => clearInterval(timer);
  }, []);

  // --- NOUVELLE FONCTION : MESSAGE BETA ---
  const checkBetaMessage = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('hasSeenBetaMessage');
      
      // Si l'utilisateur n'a jamais vu le message (null), on l'affiche
      if (hasSeen === null) {
        Alert.alert(
          "⚠️ Version Bêta & Communauté",
          "Bienvenue ! Cette application repose à 100% sur l'entraide.\n\n" +
          "Si tout le monde joue le jeu, ça marche.\n" +
          "Si vous prenez une place sans la signaler libérée plus tard, l'appli mourra.\n\n" +
          "Comptez-vous jouer le jeu ?",
          [
            {
                text: "Non, je quitte",
                style: "cancel",
                onPress: () => {
                    // On ne fait rien, ou on pourrait fermer l'app (BackHandler)
                    // Mais on ne sauvegarde pas, donc le message reviendra.
                } 
            },
            { 
              text: "🤝 Je joue le jeu !", 
              onPress: async () => {
                // On enregistre qu'il a accepté, le message ne reviendra plus
                await AsyncStorage.setItem('hasSeenBetaMessage', 'true');
              }
            }
          ],
          { cancelable: false } // Oblige à cliquer sur un bouton
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkSavedCar = async () => {
    try {
      const saved = await AsyncStorage.getItem('myCar');
      if (saved) setMyCar(JSON.parse(saved));
    } catch (e) { console.log(e); }
  };

  // ---------------------------------------------------------
  // API
  // ---------------------------------------------------------
  const fetchParkings = async () => {
    try {
      const response = await fetch(`${API_URL}/parkings`);
      const data = await response.json();
      setParkings(data);
    } catch (error) { }
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
    } catch (error) { }
  };

  const sendSpot = async (typeMessage, specificLat = null, specificLong = null) => {
    try {
      let lat, long;
      if (specificLat && specificLong) {
        lat = specificLat; long = specificLong;
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude; long = location.coords.longitude;
      }

      const newPlace = {
        latitude: lat,
        longitude: long,
        message: typeMessage,
        status: "libre",
        created_at: new Date().toISOString()
      };

      await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      });

      fetchParkings(); 
      return true;
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'envoi.");
      return false;
    }
  };

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------
  const handleParkMe = async (idSpotToDelete) => {
    if (idSpotToDelete) {
        try { await fetch(`${API_URL}/parkings/${idSpotToDelete}`, { method: 'DELETE' }); } catch(e){}
    }
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    let location = await Location.getCurrentPositionAsync({});
    const carData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        date: new Date().toLocaleTimeString()
    };
    await AsyncStorage.setItem('myCar', JSON.stringify(carData));
    setMyCar(carData);
    fetchParkings();
    if (Platform.OS === 'android') {
        ToastAndroid.show("Voiture enregistrée 📍", ToastAndroid.SHORT);
    } else {
        Alert.alert("Garé !", "Position enregistrée.");
    }
  };

  const handleLeaveSpot = async () => {
    if (!myCar) return;
    Alert.alert(
        "Départ", "Vous libérez votre place ?",
        [
            { text: "Non", style: "cancel" },
            { 
                text: "Oui, je pars ! 🚗", 
                onPress: async () => {
                    await sendSpot("Libérée par conducteur ⚡", myCar.latitude, myCar.longitude);
                    await AsyncStorage.removeItem('myCar');
                    setMyCar(null);
                    if (Platform.OS === 'android') {
                        ToastAndroid.show("Merci ! Place partagée 🤝", ToastAndroid.SHORT);
                    }
                }
            }
        ]
    );
  };

  const takePlace = (id, lat, long, message) => {
    Alert.alert(
      message, "Action :",
      [
        { 
            text: "❌ Fausse/Occupée", style: 'destructive',
            onPress: async () => {
                try {
                    await fetch(`${API_URL}/parkings/${id}`, { method: 'DELETE' });
                    if (Platform.OS === 'android') ToastAndroid.show("Place supprimée.", ToastAndroid.SHORT);
                    fetchParkings();
                } catch (e) {}
            }
        },
        { 
          text: "✅ Garé !", 
          onPress: () => {
            if (myCar) Alert.alert("Impossible", "Vous êtes déjà garé !");
            else handleParkMe(id);
          }
        },
        { 
            text: "🗺️ GO !", 
            onPress: () => {
                if (myCar) Alert.alert("Impossible", "Vous êtes déjà garé !");
                else Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${long}`);
            }
        }
      ],
      { cancelable: true }
    );
  };
  // ---------------------------------------------------------
  // LOGIQUE COULEURS & TEMPS
  // ---------------------------------------------------------
  const getSpotStatus = (dateString) => {
    if (!dateString) return { color: 'gray', visible: false }; // Sécurité

    const now = new Date();
    const spotDate = new Date(dateString);
    const diffMs = now - spotDate; // Différence en millisecondes
    const diffMins = diffMs / 1000 / 60; // Conversion en minutes

    if (diffMins < 5) return { color: 'green', visible: true };   // 0-5 min : Vert (Frais)
    if (diffMins < 10) return { color: 'orange', visible: true }; // 5-10 min : Orange (Moyen)
    if (diffMins < 15) return { color: 'red', visible: true };    // 10-15 min : Rouge (Vieux)
    
    return { color: 'gray', visible: false }; // > 15 min : Invisible
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map} 
        initialRegion={initialRegion}
        showsUserLocation={true} 
        showsMyLocationButton={false}
      >
        {myCar && (
            <Marker coordinate={{ latitude: myCar.latitude, longitude: myCar.longitude }} pinColor="blue" title="Ma voiture 📍" zIndex={1} />
        )}

        {parkings.map((spot) => {
          const status = getSpotStatus(spot.created_at);
          
          if (!status.visible) return null;

          return (
            <Marker
              // 👇 MODIFICATION ICI 👇
              // On ajoute la couleur dans la 'key'. 
              // Dès que la couleur change, la clé change, et le marqueur se redessine force.
              key={`${spot.id}_${status.color}`}
              
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              pinColor={status.color} 
              zIndex={2}
              title={`${Math.round((new Date() - new Date(spot.created_at))/60000)} min`}
              onPress={() => takePlace(spot.id, spot.latitude, spot.longitude, spot.message)}
            />
          );
        })}
      </MapView>

      <View style={styles.buttonsContainer}>
        
        <View style={styles.dummyZone}>
             <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
               <MaterialIcons name="my-location" size={28} color="#555" />
            </TouchableOpacity>
        </View>

        {myCar ? (
            <TouchableOpacity style={styles.bigRedButton} onPress={handleLeaveSpot}>
                <Text style={styles.bigBtnIcon}>🚗</Text>
                <Text style={styles.bigBtnText}>JE PARS !</Text>
            </TouchableOpacity>
        ) : (
            <View />
        )}

        <TouchableOpacity style={styles.reportButton} onPress={() => sendSpot("Vue piéton 👀")}>
            <Text style={styles.btnMainText}>👀</Text>
            <Text style={[styles.btnSubText, {textAlign: 'center'}]}>Je vois une place !</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  buttonsContainer: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
  },
  dummyZone: {
    width: 90, 
    alignItems: 'flex-start', 
  },
  centerButton: {
    backgroundColor: 'white', width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
    marginBottom: 10, 
  },
  reportButton: {
    backgroundColor: '#3498db', width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center', elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5,
    borderWidth: 4, borderColor: 'white',
  },
  bigRedButton: {
    backgroundColor: '#e74c3c', 
    width: 130, height: 130, borderRadius: 65, 
    justifyContent: 'center', alignItems: 'center', 
    elevation: 15, 
    shadowColor: '#c0392b', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10,
    borderWidth: 6, borderColor: 'white',
    marginBottom: 0, 
  },
  btnIcon: { fontSize: 24 },
  btnMainText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  btnSubText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: -5 },
  bigBtnIcon: { fontSize: 50, marginBottom: -5 }, 
  bigBtnText: { fontSize: 18, fontWeight: 'bold', color: 'white' } 
});