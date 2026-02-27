import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { TrackItem } from '../components/TrackItem';
import { useFlowStore } from '../store/useStore';

export default function TrackSelectionScreen() {
    const router = useRouter();
    const {
        foundTracks,
        selectedTrackIds,
        toggleSelectTrack,
        selectAllTracks,
        deselectAllTracks
    } = useFlowStore();

    const handleSelectAllToggle = () => {
        if (selectedTrackIds.length === foundTracks.length) {
            deselectAllTracks();
        } else {
            selectAllTracks();
        }
    };

    const handleDispatch = () => {
        if (selectedTrackIds.length > 0) {
            router.push('/search-dispatch');
        }
    };

    const isAllSelected = selectedTrackIds.length === foundTracks.length && foundTracks.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    {foundTracks.length} titres trouvés dans la vidéo
                </Text>

                <Button
                    title={isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                    variant="secondary"
                    onPress={handleSelectAllToggle}
                    style={styles.selectAllBtn}
                />

                <FlatList
                    data={foundTracks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TrackItem
                            track={item}
                            selected={selectedTrackIds.includes(item.id)}
                            onToggleSelect={() => toggleSelectTrack(item.id)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>

            <View style={styles.footer}>
                <Button
                    title={`Diguer ${selectedTrackIds.length > 0 ? `(${selectedTrackIds.length})` : ''} les pistes`}
                    onPress={handleDispatch}
                    disabled={selectedTrackIds.length === 0}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    subtitle: {
        color: '#AAA',
        fontSize: 16,
        marginBottom: 16,
    },
    selectAllBtn: {
        marginBottom: 16,
    },
    footer: {
        padding: 24,
        paddingBottom: 32,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderColor: '#333',
    },
});
