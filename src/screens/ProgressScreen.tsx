import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarriorData } from '../hooks/useWarriorData';
import { WeightLog } from '../hooks/types';
import { Header } from '../components/Header';
import { getTheme } from '../theme/colors';

export default function ProgressScreen() {
    const { weightLogs, getCurrentStreak } = useWarriorData();
    const isDark = false;
    const theme = getTheme(isDark);

    const liftLogs = weightLogs.filter(w => w.type === 'lift');

    // Calculate 7-day volume vs previous 7-day volume
    const msInWeek = 1000 * 60 * 60 * 24 * 7;
    const now = new Date().getTime();

    let thisWeekVolume = 0;
    let lastWeekVolume = 0;

    liftLogs.forEach(log => {
        const logTime = new Date(log.date).getTime();
        const diff = now - logTime;
        const vol = log.weight * (log.reps || 1);

        if (diff <= msInWeek) {
            thisWeekVolume += vol;
        } else if (diff <= msInWeek * 2) {
            lastWeekVolume += vol;
        }
    });

    const volumeChange = lastWeekVolume > 0
        ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100)
        : 0;

    const streak = getCurrentStreak();

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
                        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>This Week's Volume</Text>
                        <Text style={[styles.cardValue, { color: theme.text }]}>
                            {thisWeekVolume} <Text style={styles.cardUnit}>kg</Text>
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

                {/* History */}
                <View style={styles.historySection}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted, marginBottom: 16 }]}>RECENT LIFT HISTORY</Text>

                    {liftLogs.slice(0, 10).map((log: WeightLog) => (
                        <View key={log.id} style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View>
                                <Text style={[styles.historyTitle, { color: theme.text }]}>
                                    {log.exercise || 'Lift'}
                                </Text>
                                <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                                    {new Date(log.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.historyWeight, { color: theme.text }]}>{log.weight} kg</Text>
                            </View>
                        </View>
                    ))}

                    {liftLogs.length === 0 && (
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
