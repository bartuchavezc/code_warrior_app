import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWarriorData } from '../hooks/useWarriorData';
import { Header } from '../components/Header';
import { ExerciseItem } from '../components/ExerciseItem';
import { getTheme } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

export default function WorkoutScreen() {
    const { routine, progress, toggleExercise, logWeight, finishSession, updateRoutine, addDayToRoutine, addExerciseToDay, deleteDayFromRoutine, deleteExerciseFromDay } = useWarriorData();
    const navigation = useNavigation<any>();
    const isDark = false; // TODO: handle dark mode toggle if needed later
    const theme = getTheme(isDark);

    // Default to day 1 id
    const [selectedDayId, setSelectedDayId] = useState<string>('dia1');

    // Weight Log Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeExercise, setActiveExercise] = useState<any>(null);
    const [weightInput, setWeightInput] = useState('');

    // Add Day Modal
    const [isAddDayModalVisible, setIsAddDayModalVisible] = useState(false);
    const [newDayTitle, setNewDayTitle] = useState('');
    const [newDaySubtitle, setNewDaySubtitle] = useState('');

    // Add Exercise Modal
    const [isAddExerciseModalVisible, setIsAddExerciseModalVisible] = useState(false);
    const [newExName, setNewExName] = useState('');
    const [newExSets, setNewExSets] = useState('');
    const [newExReps, setNewExReps] = useState('');

    // CSV Modal
    const [isCsvModalVisible, setIsCsvModalVisible] = useState(false);
    const [csvInput, setCsvInput] = useState('');

    const handleParseCSV = async () => {
        if (!csvInput.trim()) {
            setIsCsvModalVisible(false);
            return;
        }

        const lines = csvInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let newRoutineArray: any[] = [];
        let error = false;

        try {
            const tempMap: Record<string, any> = {};
            let dayCounter = 1;

            lines.forEach((line, index) => {
                const parts = line.split(',').map(p => p.trim());
                if (index === 0 && (parts[0].toLowerCase() === 'dia' || parts[0].toLowerCase() === 'day')) return;

                if (parts.length >= 4) {
                    const [dayName, exerciseName, sets, reps] = parts;
                    let existingDay = Object.values(tempMap).find(d => d.title === dayName);

                    if (!existingDay) {
                        const newId = `dia${dayCounter++}`;
                        tempMap[newId] = {
                            id: newId,
                            title: dayName,
                            subtitle: 'Entrenamiento',
                            exercises: []
                        };
                        existingDay = tempMap[newId];
                    }

                    existingDay.exercises.push({
                        id: `ex_${Date.now()}_${Math.random()}`,
                        name: exerciseName,
                        sets: sets,
                        reps: reps,
                        notes: ''
                    });
                }
            });
            newRoutineArray = Object.values(tempMap);
        } catch (e) {
            error = true;
        }

        if (!error && newRoutineArray.length > 0) {
            await updateRoutine(newRoutineArray);
            setIsCsvModalVisible(false);
            setCsvInput('');
            setSelectedDayId(newRoutineArray[0].id);
            alert('¡Rutina CSV cargada con éxito!');
        } else {
            alert('Error al leer el CSV. Usa el formato: Día, Ejercicio, Series, Repeticiones');
        }
    };

    const activeDay = useMemo(() => {
        return routine.find(d => d.id === selectedDayId) || routine[0];
    }, [routine, selectedDayId]);

    const completedInActiveDay = progress[activeDay.id]?.completedExercises || [];
    const totalExercises = activeDay.exercises.length;
    const progressPercentage = totalExercises > 0
        ? Math.round((completedInActiveDay.length / totalExercises) * 100)
        : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Header title="Warrior-Coder" isDark={isDark} onSettingsPress={() => setIsCsvModalVisible(true)} />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                {/* Custom date/day selector logic placeholder, sticking to simple UI */}
                <View style={styles.titleSection}>
                    <Text style={[styles.dateLabel, { color: theme.primary }]}>
                        RUTINA ACTUAL
                    </Text>
                    <Text style={[styles.title, { color: theme.text }]}>{activeDay.title}</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>{activeDay.subtitle}</Text>
                </View>

                {/* Day selector tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.daySelector}>
                    {routine.map((day) => (
                        <TouchableOpacity
                            key={day.id}
                            style={[
                                styles.dayTab,
                                selectedDayId === day.id && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setSelectedDayId(day.id)}
                        >
                            <Text style={[
                                styles.dayTabText,
                                { color: theme.textMuted },
                                selectedDayId === day.id && { color: 'white', fontWeight: 'bold' }
                            ]}>
                                {day.id.replace('dia', 'Día ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {/* Add Day Button */}
                    <TouchableOpacity
                        style={[styles.dayTab, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16 }]}
                        onPress={() => setIsAddDayModalVisible(true)}
                    >
                        <Text style={[styles.dayTabText, { color: theme.primary, fontWeight: 'bold', fontSize: 18, marginTop: -2 }]}>
                            +
                        </Text>
                    </TouchableOpacity>

                    {/* Spacer to push delete button to the end if scrolling allows, but keep it in row */}
                    {routine.length > 1 && (
                        <TouchableOpacity
                            style={[styles.dayTab, { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#f87171', paddingHorizontal: 16, marginLeft: 'auto' }]}
                            onPress={() => {
                                Alert.alert(
                                    "Eliminar Día",
                                    `¿Seguro que deseas eliminar "${activeDay.title}"?`,
                                    [
                                        { text: "Cancelar", style: "cancel" },
                                        {
                                            text: "Eliminar",
                                            style: "destructive",
                                            onPress: async () => {
                                                const success = await deleteDayFromRoutine(activeDay.id);
                                                if (success) {
                                                    setSelectedDayId(routine[0].id === activeDay.id ? routine[1].id : routine[0].id);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <MaterialIcons name="delete-outline" size={20} color="#dc2626" />
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
                            Progreso de la sesión
                        </Text>
                        <Text style={[styles.progressValue, { color: theme.primary }]}>
                            {progressPercentage}%
                        </Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                        <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${progressPercentage}%` }]} />
                    </View>
                </View>

                {/* Exercises List */}
                <View style={styles.exercisesList}>
                    {activeDay.exercises.map((exercise) => {
                        const isChecked = completedInActiveDay.includes(exercise.id);
                        return (
                            <ExerciseItem
                                key={exercise.id}
                                title={exercise.name}
                                subtitle={`${exercise.sets} series x ${exercise.reps}`}
                                notes={exercise.notes}
                                isChecked={isChecked}
                                onToggle={() => {
                                    if (!isChecked) {
                                        setActiveExercise(exercise);
                                        setWeightInput('');
                                        setIsModalVisible(true);
                                    } else {
                                        // just untoggle
                                        toggleExercise(activeDay.id, exercise.id);
                                    }
                                }}
                                onDelete={async () => {
                                    Alert.alert(
                                        "Eliminar Ejercicio",
                                        `¿Seguro que deseas eliminar "${exercise.name}"?`,
                                        [
                                            { text: "Cancelar", style: "cancel" },
                                            {
                                                text: "Eliminar",
                                                style: "destructive",
                                                onPress: async () => {
                                                    await deleteExerciseFromDay(activeDay.id, exercise.id);
                                                }
                                            }
                                        ]
                                    );
                                }}
                                isDark={isDark}
                            />
                        )
                    })}

                    <TouchableOpacity
                        style={[styles.addExerciseCard, { borderColor: theme.primary, backgroundColor: theme.primary + '11' }]}
                        onPress={() => setIsAddExerciseModalVisible(true)}
                    >
                        <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>+ Añadir Ejercicio</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.finishButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                    onPress={async () => {
                        await finishSession();
                        alert('¡Entrenamiento Finalizado! ¡Buen trabajo!');
                        navigation.navigate('Progreso');
                    }}
                >
                    <Text style={styles.finishButtonText}>Finalizar Entrenamiento</Text>
                </TouchableOpacity>

            </ScrollView>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView
                        style={{ width: '100%' }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Registrar Peso</Text>
                            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                                {activeExercise?.name}
                            </Text>

                            <TextInput
                                style={[styles.modalInput, { borderColor: theme.primary, color: theme.text }]}
                                placeholder="Ej. 60"
                                placeholderTextColor={theme.textMuted}
                                keyboardType="phone-pad"
                                autoFocus={true}
                                value={weightInput}
                                onChangeText={setWeightInput}
                                onSubmitEditing={() => {
                                    if (weightInput && activeExercise) {
                                        const parsed = parseFloat(weightInput);
                                        if (!isNaN(parsed) && parsed > 0) {
                                            logWeight(activeExercise.name, parsed, parseInt(activeExercise.reps) || 1);
                                        }
                                    }
                                    toggleExercise(activeDay.id, activeExercise.id);
                                    setIsModalVisible(false);
                                }}
                            />
                            <Text style={[styles.modalUnitText, { color: theme.textMuted }]}>kg</Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalCancelBtn}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                                    onPress={() => {
                                        if (weightInput && activeExercise) {
                                            const parsed = parseFloat(weightInput);
                                            if (!isNaN(parsed) && parsed > 0) {
                                                logWeight(activeExercise.name, parsed, parseInt(activeExercise.reps) || 1);
                                            }
                                        }
                                        if (activeExercise) {
                                            toggleExercise(activeDay.id, activeExercise.id);
                                        }
                                        setIsModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalSaveText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* CSV Load Modal */}
            <Modal
                visible={isCsvModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsCsvModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView
                        style={{ width: '100%' }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Cargar Rutina .CSV</Text>
                            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                                Pega aquí tu rutina separada por comas.
                            </Text>

                            <TextInput
                                style={[styles.csvInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                                placeholder={`Día 1, Sentadilla, 3, 10\nDía 1, Press Banca, 3, 8`}
                                placeholderTextColor={theme.textMuted}
                                multiline={true}
                                value={csvInput}
                                onChangeText={setCsvInput}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsCsvModalVisible(false)}>
                                    <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]} onPress={handleParseCSV}>
                                    <Text style={styles.modalSaveText}>Importar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Add Day Modal */}
            <Modal
                visible={isAddDayModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAddDayModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView
                        style={{ width: '100%' }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo Día</Text>
                            <TextInput
                                style={[styles.textInputFull, { borderColor: theme.border, color: theme.text }]}
                                placeholder="Nombre (ej. Pierna y Hombro)"
                                placeholderTextColor={theme.textMuted}
                                value={newDayTitle}
                                onChangeText={setNewDayTitle}
                            />
                            <TextInput
                                style={[styles.textInputFull, { borderColor: theme.border, color: theme.text, marginTop: 12 }]}
                                placeholder="Descripción corta"
                                placeholderTextColor={theme.textMuted}
                                value={newDaySubtitle}
                                onChangeText={setNewDaySubtitle}
                            />
                            <View style={[styles.modalActions, { marginTop: 24 }]}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsAddDayModalVisible(false)}>
                                    <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                                    onPress={async () => {
                                        if (newDayTitle.trim()) {
                                            const newId = await addDayToRoutine(newDayTitle, newDaySubtitle);
                                            setSelectedDayId(newId);
                                            setNewDayTitle('');
                                            setNewDaySubtitle('');
                                            setIsAddDayModalVisible(false);
                                        }
                                    }}>
                                    <Text style={styles.modalSaveText}>Crear</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Add Exercise Modal */}
            <Modal
                visible={isAddExerciseModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAddExerciseModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView
                        style={{ width: '100%' }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Añadir Ejercicio</Text>
                            <TextInput
                                style={[styles.textInputFull, { borderColor: theme.border, color: theme.text }]}
                                placeholder="Nombre del Ejercicio"
                                placeholderTextColor={theme.textMuted}
                                value={newExName}
                                onChangeText={setNewExName}
                            />
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                <TextInput
                                    style={[styles.textInputFull, { flex: 1, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Series (ej. 4)"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="number-pad"
                                    value={newExSets}
                                    onChangeText={setNewExSets}
                                />
                                <TextInput
                                    style={[styles.textInputFull, { flex: 1, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Reps (ej. 8-12)"
                                    placeholderTextColor={theme.textMuted}
                                    value={newExReps}
                                    onChangeText={setNewExReps}
                                />
                            </View>
                            <View style={[styles.modalActions, { marginTop: 24 }]}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsAddExerciseModalVisible(false)}>
                                    <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                                    onPress={async () => {
                                        if (newExName.trim()) {
                                            await addExerciseToDay(activeDay.id, newExName, newExSets, newExReps);
                                            setNewExName('');
                                            setNewExSets('');
                                            setNewExReps('');
                                            setIsAddExerciseModalVisible(false);
                                        }
                                    }}>
                                    <Text style={styles.modalSaveText}>Añadir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    titleSection: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    daySelector: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 24,
        gap: 8,
    },
    dayTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e2e8f0', // default subtle background
    },
    dayTabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    exercisesList: {
        paddingHorizontal: 24,
    },
    addExerciseCard: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    finishButton: {
        marginHorizontal: 24,
        marginTop: 40,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    finishButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    modalInput: {
        width: 120,
        height: 64,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottomWidth: 2,
        marginBottom: 8,
    },
    modalUnitText: {
        fontSize: 16,
        marginBottom: 32,
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalSaveBtn: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    modalSaveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    csvInput: {
        width: '100%',
        height: 120,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        textAlignVertical: 'top',
    },
    textInputFull: {
        width: '100%',
        height: 52,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    }
});
