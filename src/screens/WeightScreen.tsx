import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarriorData } from '../hooks/useWarriorData';
import { Header } from '../components/Header';
import { getTheme } from '../theme/colors';

export default function WeightScreen() {
    const { weightLogs, logBodyWeight } = useWarriorData();
    const isDark = false;
    const theme = getTheme(isDark);

    const [bodyWeightInput, setBodyWeightInput] = useState('');

    const handleLogWeight = () => {
        const num = parseFloat(bodyWeightInput);
        if (!isNaN(num) && num > 0) {
            logBodyWeight(num);
            setBodyWeightInput('');
        }
    };

    const bodyWeightLogs = weightLogs.filter(w => w.type === 'body');
    const currentWeight = bodyWeightLogs.length > 0 ? bodyWeightLogs[0].weight : '--';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Adjust offset if necessary for bottom tab height
            >
                <Header title="Peso Corporal" isDark={isDark} />

                <ScrollView style={styles.content}>

                    <View style={styles.overviewHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>GESTIÓN DE PESO</Text>
                        <View style={[styles.badge, { backgroundColor: theme.primary + '1a' }]}>
                            <Text style={[styles.badgeText, { color: theme.primary }]}>Actual</Text>
                        </View>
                    </View>

                    {/* Cards */}
                    <View style={styles.cardsRow}>
                        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Peso Actual</Text>
                            <Text style={[styles.cardValue, { color: theme.text }]}>
                                {currentWeight} <Text style={styles.cardUnit}>kg</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Log Manual Weight */}
                    <View style={styles.logActionRow}>
                        <TextInput
                            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
                            placeholder="Ej. 78.5"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="decimal-pad"
                            value={bodyWeightInput}
                            onChangeText={setBodyWeightInput}
                        />
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                            onPress={handleLogWeight}
                        >
                            <Text style={styles.actionBtnText}>Registrar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* History */}
                    <View style={styles.historySection}>
                        <Text style={[styles.sectionTitle, { color: theme.textMuted, marginBottom: 16 }]}>HISTORIAL</Text>

                        {bodyWeightLogs.map((log) => (
                            <View key={log.id} style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View>
                                    <Text style={[styles.historyTitle, { color: theme.text }]}>
                                        Registro
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

                        {bodyWeightLogs.length === 0 && (
                            <Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 24 }}>
                                No hay registros de peso aún.
                            </Text>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
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
    logActionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    input: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    actionBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    actionBtnText: {
        color: 'white',
        fontSize: 14,
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
