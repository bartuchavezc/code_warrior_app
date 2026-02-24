import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarriorData } from '../hooks/useWarriorData';
import { WeightLog } from '../hooks/types';
import { Header } from '../components/Header';
import { getTheme } from '../theme/colors';

export default function ProgressScreen() {
    const { weightLogs, sessionDates, getCurrentStreak, deleteWeightLog, deleteSession } = useWarriorData();
    const isDark = false;
    const theme = getTheme(isDark);

    const liftLogs = weightLogs.filter(w => w.type === 'lift');

    // Calculate 7-day average lift vs previous 7-day average
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const now = new Date().getTime();

    let thisWeekTotal = 0;
    let thisWeekCount = 0;
    let lastWeekTotal = 0;
    let lastWeekCount = 0;

    liftLogs.forEach(log => {
        const logTime = new Date(log.date).getTime();
        const diff = now - logTime;

        if (diff <= msInWeek) {
            thisWeekTotal += log.weight;
            thisWeekCount += 1;
        } else if (diff <= msInWeek * 2) {
            lastWeekTotal += log.weight;
            lastWeekCount += 1;
        }
    });

    const thisWeekAvg = thisWeekCount > 0 ? thisWeekTotal / thisWeekCount : 0;
    const lastWeekAvg = lastWeekCount > 0 ? lastWeekTotal / lastWeekCount : 0;

    const volumeChange = lastWeekAvg > 0
        ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
        : 0;

    const streak = getCurrentStreak();

    const sortedSessionDates = useMemo(
        () => [...sessionDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
        [sessionDates]
    );

    const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);

    const selectedDate = sortedSessionDates[selectedSessionIndex] || null;
    const selectedLiftLogs = selectedDate
        ? liftLogs.filter(log => log.date.split('T')[0] === selectedDate)
        : liftLogs;

    const formatSessionLabel = (dateStr: string, index: number) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        return date.toLocaleDateString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Header title="Warrior-Coder Progress" isDark={isDark} />

            <ScrollView style={styles.content}>

                <View style={styles.overviewHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>OVERVIEW</Text>
                    <View style={[styles.badge, { backgroundColor: theme.primary + '1a' }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>Last 30 Days</Text>
                    </View>
                </View>

                {/* Cards */}
                <View style={styles.cardsRow}>
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Average Lift (This Week)</Text>
                        <Text style={[styles.cardValue, { color: theme.text }]}>
                            {thisWeekAvg.toFixed(1)} <Text style={styles.cardUnit}>kg</Text>
                        </Text>
                        <Text style={[styles.trendText, { color: volumeChange >= 0 ? theme.primary : '#ef4444' }]}>
                            {volumeChange >= 0 ? '+' : ''}{volumeChange}% vs Last Week
                        </Text>
                    </View>
                </View>

                {/* Secondary Cards Row */}
                <View style={styles.cardsRow}>
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Current Streak</Text>
                        <Text style={[styles.cardValue, { color: theme.text }]}>
                            {streak} <Text style={styles.cardUnit}>days</Text>
                        </Text>
                    </View>
                </View>

                {/* Session timeline */}
                {sortedSessionDates.length > 0 && (
                    <View style={styles.sessionsSection}>
                        <View style={styles.sessionsHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>SESIONES</Text>
                            {selectedDate && (
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Eliminar sesión',
                                            `¿Seguro que deseas eliminar la sesión del ${formatSessionLabel(selectedDate, selectedSessionIndex)}?`,
                                            [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Eliminar',
                                                    style: 'destructive',
                                                    onPress: () => {
                                                        deleteSession(selectedDate);
                                                        if (selectedSessionIndex >= sortedSessionDates.length - 1) {
                                                            setSelectedSessionIndex(Math.max(0, sortedSessionDates.length - 2));
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Eliminar sesión</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.sessionsScroll}
                        >
                            {sortedSessionDates.map((dateStr, index) => (
                                <TouchableOpacity
                                    key={dateStr}
                                    style={[
                                        styles.sessionChip,
                                        index === selectedSessionIndex && { backgroundColor: theme.primary + '22', borderColor: theme.primary }
                                    ]}
                                    onPress={() => setSelectedSessionIndex(index)}
                                >
                                    <Text
                                        style={[
                                            styles.sessionChipText,
                                            { color: index === selectedSessionIndex ? theme.primary : theme.textMuted }
                                        ]}
                                    >
                                        {formatSessionLabel(dateStr, index)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* History */}
                <View style={styles.historySection}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted, marginBottom: 16 }]}>
                        HISTORIAL DE LIFTS {selectedDate ? `(sesión ${formatSessionLabel(selectedDate, selectedSessionIndex)})` : ''}
                    </Text>

                    {selectedLiftLogs.slice(0, 10).map((log: WeightLog) => (
                        <TouchableOpacity
                            key={log.id}
                            style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onLongPress={() => {
                                Alert.alert(
                                    'Eliminar registro',
                                    `¿Eliminar registro de ${log.exerciseId} (${log.weight} kg)?`,
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Eliminar',
                                            style: 'destructive',
                                            onPress: () => deleteWeightLog(log.id)
                                        }
                                    ]
                                );
                            }}
                        >
                            <View>
                                <Text style={[styles.historyTitle, { color: theme.text }]}>
                                    {log.exerciseId || 'Lift'}
                                </Text>
                                <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                                    {new Date(log.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.historyWeight, { color: theme.text }]}>{log.weight} kg</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {selectedLiftLogs.length === 0 && (
                        <Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 24 }}>
                            No hay registros aún.
                        </Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#94a3b8',
    },
    trendText: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold',
    },
    historySection: {
        paddingBottom: 40,
    },
    sessionsSection: {
        marginBottom: 24,
    },
    sessionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sessionsScroll: {
        paddingVertical: 8,
        paddingRight: 8,
    },
    sessionChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    sessionChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
    },
    historyWeight: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
