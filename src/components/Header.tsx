import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTheme } from '../theme/colors';

// Mocks the index.html design
export const Header = ({ title, showBack = false, isDark = false, onSettingsPress }: { title: string, showBack?: boolean, isDark?: boolean, onSettingsPress?: () => void }) => {
    const theme = getTheme(isDark);

    return (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.iconPlaceholder}>
                {showBack && (
                    <Pressable
                        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                    </Pressable>
                )}
            </View>

            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

            <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
                onPress={onSettingsPress}
            >
                <MaterialIcons name="settings" size={24} color={theme.text} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 999,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
