import React from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { useSettingsStore } from '../../store/useStore';

export default function SettingsScreen() {
    const {
        automationEnabled,
        setAutomationEnabled,
        soundcloudConnected,
        spotifyConnected,
        deezerConnected,
        toggleConnection
    } = useSettingsStore();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Paramètres</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Automatisation</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>
                            Envoyer automatiquement les pistes sélectionnées vers ma Diglist SoundCloud
                        </Text>
                        <Switch
                            value={automationEnabled}
                            onValueChange={setAutomationEnabled}
                            trackColor={{ false: '#333', true: '#4CD964' }}
                            thumbColor="#FFF"
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connexions API (Mocks)</Text>

                    <View style={styles.connectionRow}>
                        <Button
                            title={soundcloudConnected ? "Déconnecter SoundCloud" : "Connecter SoundCloud"}
                            variant={soundcloudConnected ? 'secondary' : 'primary'}
                            onPress={() => toggleConnection('soundcloud')}
                        />
                    </View>

                    <View style={styles.connectionRow}>
                        <Button
                            title={spotifyConnected ? "Déconnecter Spotify" : "Connecter Spotify"}
                            variant={spotifyConnected ? 'secondary' : 'primary'}
                            onPress={() => toggleConnection('spotify')}
                        />
                    </View>

                    <View style={styles.connectionRow}>
                        <Button
                            title={deezerConnected ? "Déconnecter Deezer" : "Connecter Deezer"}
                            variant={deezerConnected ? 'secondary' : 'primary'}
                            onPress={() => toggleConnection('deezer')}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        color: '#CCC',
        marginRight: 16,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 24,
    },
    connectionRow: {
        marginBottom: 12,
    },
});
