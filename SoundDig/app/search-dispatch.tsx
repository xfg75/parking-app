import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { TrackItem } from '../components/TrackItem';
import { dispatchToSoundCloud, PlatformAvailability, searchTrackOnPlatforms, Track } from '../services/mockServices';
import { useFlowStore, useSettingsStore } from '../store/useStore';

interface SearchResult {
    track: Track;
    platforms: PlatformAvailability;
}

export default function SearchDispatchScreen() {
    const router = useRouter();
    const { automationEnabled } = useSettingsStore();
    const { foundTracks, selectedTrackIds, clearFlow } = useFlowStore();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        let isMounted = true;

        const processTracks = async () => {
            // 1. Filter selected tracks
            const tracksToProcess = foundTracks.filter(t => selectedTrackIds.includes(t.id));

            if (automationEnabled) {
                // Automatic mode: simulate pushing direct to Soundcloud Diglist
                await dispatchToSoundCloud(selectedTrackIds);
                if (isMounted) {
                    setLoading(false);
                    setSuccess(true);
                }
            } else {
                // Manual mode: Search each track on platforms
                const searchedResults: SearchResult[] = [];
                for (const track of tracksToProcess) {
                    const platforms = await searchTrackOnPlatforms(track);
                    searchedResults.push({ track, platforms });
                }
                if (isMounted) {
                    setResults(searchedResults);
                    setLoading(false);
                }
            }
        };

        processTracks();

        return () => { isMounted = false; };
    }, [automationEnabled, foundTracks, selectedTrackIds]);

    const handleFinish = () => {
        clearFlow();
        router.replace('/(tabs)');
    };

    const renderPlatformIcons = (platforms: PlatformAvailability) => {
        return (
            <View style={styles.platformIconsContainer}>
                {platforms.spotify && <Ionicons name="logo-youtube" size={24} color="#1DB954" style={styles.icon} />}
                {platforms.soundcloud && <Ionicons name="logo-soundcloud" size={24} color="#FF5500" style={styles.icon} />}
                {platforms.deezer && <Ionicons name="musical-notes" size={24} color="#00C7F2" style={styles.icon} />}
                {platforms.youtubeMusic && <Ionicons name="logo-youtube" size={24} color="#FF0000" style={styles.icon} />}
                {platforms.beatport && <Ionicons name="headset" size={24} color="#02FFB3" style={styles.icon} />}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
                <Text style={styles.loadingText}>Recherche sur les plateformes...</Text>
            </View>
        );
    }

    if (automationEnabled && success) {
        return (
            <View style={styles.centeredContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#4CD964" style={styles.successIcon} />
                <Text style={styles.successText}>Pistes ajoutées à votre Diglist SoundCloud !</Text>
                <Button title="Retour à l'accueil" onPress={handleFinish} style={styles.finishBtn} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Résultats de la recherche</Text>
                <Text style={styles.subtitle}>Ajoutez manuellement les pistes sur vos plateformes favorites.</Text>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.track.id}
                renderItem={({ item }) => (
                    <TrackItem
                        track={item.track}
                        showCheckbox={false}
                        rightElement={renderPlatformIcons(item.platforms)}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            />

            <View style={styles.footer}>
                <Button title="Terminer" onPress={handleFinish} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    header: {
        padding: 24,
    },
    title: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        color: '#AAA',
        fontSize: 14,
    },
    loader: {
        marginBottom: 24,
    },
    loadingText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    successIcon: {
        marginBottom: 24,
    },
    successText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 32,
    },
    finishBtn: {
        width: '100%',
    },
    platformIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: 12,
    },
    footer: {
        padding: 24,
        paddingBottom: 32,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderColor: '#333',
    },
});
