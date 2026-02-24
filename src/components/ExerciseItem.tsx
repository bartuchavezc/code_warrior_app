import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTheme } from '../theme/colors';

type ExerciseItemProps = {
    title: string;
    subtitle: string;
    notes?: string;
    isChecked: boolean;
    onToggle: () => void;
    onDelete?: () => void;
    isDark?: boolean;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

export const ExerciseItem = ({ title, subtitle, notes, isChecked, onToggle, onDelete, isDark = false }: ExerciseItemProps) => {
    const theme = getTheme(isDark);
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <View style={styles.outerContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToOffsets={[0, SWIPE_THRESHOLD]}
                disableIntervalMomentum={true}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
            >
                {/* Main Card (Visible width of screen - padding) */}
                <Pressable
                    onPress={onToggle}
                    style={[
                        styles.container,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                            width: SCREEN_WIDTH - 48, // 24 padding each side
                        },
                        isChecked && { borderColor: theme.primary + '80' }
                    ]}
                >
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
                        {notes && <Text style={[styles.notes, { color: theme.textMuted }]}>{notes}</Text>}
                    </View>

                    <View style={styles.actionContainer}>
                        <View
                            style={[
                                styles.checkbox,
                                { borderColor: theme.border },
                                isChecked && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}>
                            {isChecked && <MaterialIcons name="check" size={16} color="white" />}
                        </View>
                    </View>
                </Pressable>

                {/* Hidden Delete Button */}
                {onDelete && (
                    <Pressable
                        style={styles.deleteButton}
                        onPress={() => {
                            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
                            onDelete();
                        }}
                    >
                        <MaterialIcons name="delete-outline" size={28} color="white" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                    </Pressable>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    scrollContent: {
        flexDirection: 'row',
    },
    container: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        flex: 1,
        paddingRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    notes: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
    },
    actionContainer: {
        justifyContent: 'center',
    },
    checkbox: {
        width: 32,
        height: 32,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: SWIPE_THRESHOLD,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    deleteText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    }
});
