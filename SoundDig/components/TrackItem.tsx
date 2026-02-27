import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Track } from '../services/mockServices';

interface TrackItemProps {
    track: Track;
    selected?: boolean;
    onToggleSelect?: () => void;
    showCheckbox?: boolean;
    rightElement?: React.ReactNode;
}

export function TrackItem({ track, selected = false, onToggleSelect, showCheckbox = true, rightElement }: TrackItemProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            onPress={onToggleSelect}
            disabled={!onToggleSelect}
        >
            <Image source={{ uri: track.coverUrl }} style={styles.cover} />

            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
            </View>

            {rightElement ? (
                rightElement
            ) : showCheckbox ? (
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected && <Ionicons name="checkmark" size={16} color="#000" />}
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginBottom: 8,
    },
    cover: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 4,
    },
    artist: {
        fontSize: 14,
        color: '#AAA',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#FFF',
        borderColor: '#FFF',
    },
});
