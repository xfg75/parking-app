import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary';
}

export function Button({ title, loading = false, variant = 'primary', style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary,
                props.disabled && styles.buttonDisabled,
                style,
            ]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#000' : '#fff'} />
            ) : (
                <Text style={[
                    styles.text,
                    variant === 'secondary' ? styles.textSecondary : styles.textPrimary,
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        width: '100%',
        marginVertical: 8,
    },
    buttonPrimary: {
        backgroundColor: '#fff',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textPrimary: {
        color: '#000',
    },
    textSecondary: {
        color: '#fff',
    },
});
