import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { extractSongsFromInstagramUrl } from '../services/mockServices';
import { useFlowStore } from '../store/useStore';

export default function ProcessingScreen() {
    const router = useRouter();
    const incomingUrl = useFlowStore((state) => state.incomingUrl);
    const setFoundTracks = useFlowStore((state) => state.setFoundTracks);

    useEffect(() => {
        let isMounted = true;

        const parseUrl = async () => {
            try {
                const tracks = await extractSongsFromInstagramUrl(incomingUrl || 'mock-url');
                if (isMounted) {
                    setFoundTracks(tracks);
                    router.replace('/track-selection');
                }
            } catch (e) {
                console.error(e);
            }
        };

        parseUrl();

        return () => { isMounted = false; };
    }, [incomingUrl, router, setFoundTracks]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
            <Text style={styles.text}>Analyse du Reel Instagram...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        marginBottom: 24,
    },
    text: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
