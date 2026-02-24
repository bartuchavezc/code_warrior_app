import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialRoutine, RoutineType, SessionProgress, WeightLog } from './types';

const PROGRESS_KEY = '@warrior_progress';
const LOGS_KEY = '@warrior_weight_logs';
const SESSION_DATES_KEY = '@warrior_session_dates';
const ROUTINE_KEY = '@warrior_routine';

export const useWarriorData = () => {
    const [routine, setRoutine] = useState<RoutineType>(initialRoutine);
    const [progress, setProgress] = useState<SessionProgress>({});
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [sessionDates, setSessionDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
            if (storedProgress) {
                setProgress(JSON.parse(storedProgress));
            }

            const storedLogs = await AsyncStorage.getItem(LOGS_KEY);
            if (storedLogs) {
                setWeightLogs(JSON.parse(storedLogs));
            }

            const storedDates = await AsyncStorage.getItem(SESSION_DATES_KEY);
            if (storedDates) {
                setSessionDates(JSON.parse(storedDates));
            }

            const storedRoutine = await AsyncStorage.getItem(ROUTINE_KEY);
            if (storedRoutine) {
                setRoutine(JSON.parse(storedRoutine));
            }
        } catch (e) {
            console.error('Failed to load data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExercise = async (dayId: string, exerciseId: string) => {
        const newProgress = { ...progress };

        if (!newProgress[dayId]) {
            newProgress[dayId] = { completedExercises: [exerciseId] };
        } else {
            const isCompleted = newProgress[dayId].completedExercises.includes(exerciseId);
            if (isCompleted) {
                newProgress[dayId].completedExercises = newProgress[dayId].completedExercises.filter((id: string) => id !== exerciseId);
            } else {
                newProgress[dayId].completedExercises.push(exerciseId);
            }
        }

        setProgress(newProgress);
        try {
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    };

    const logWeight = async (exerciseId: string, weight: number, reps?: number) => {
        const newLog: WeightLog = {
            id: Date.now().toString(),
            exerciseId,
            weight,
            reps,
            date: new Date().toISOString(),
            type: 'lift'
        };

        const newLogs = [newLog, ...weightLogs];
        setWeightLogs(newLogs);

        try {
            await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
        } catch (e) {
            console.error('Failed to save log', e);
        }
    };

    const logBodyWeight = async (weight: number) => {
        const newLog: WeightLog = {
            id: Date.now().toString(),
            exerciseId: 'bodyweight',
            weight,
            date: new Date().toISOString(),
            type: 'body'
        };

        const newLogs = [newLog, ...weightLogs];
        setWeightLogs(newLogs);

        try {
            await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
        } catch (e) {
            console.error('Failed to save log', e);
        }
    }

    const resetProgress = async () => {
        setProgress({});
        try {
            await AsyncStorage.removeItem(PROGRESS_KEY);
        } catch (e) {
            console.error('Failed to reset', e);
        }
    };

    const finishSession = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (!sessionDates.includes(todayStr)) {
            const newDates = [todayStr, ...sessionDates];
            setSessionDates(newDates);
            try {
                await AsyncStorage.setItem(SESSION_DATES_KEY, JSON.stringify(newDates));
            } catch (e) {
                console.error('Failed to save session dates', e);
            }
        }
        await resetProgress(); // Clear daily checkboxes when finishing
    };

    // Calculate current streak
    const getCurrentStreak = (): number => {
        if (sessionDates.length === 0) return 0;

        // Sort descending
        const sorted = [...sessionDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Normalize the dates
        const dateValues = sorted.map(s => {
            const d = new Date(s);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        });

        const msInDay = 1000 * 60 * 60 * 24;

        // If last session is more than 1 day ago, streak is broken
        if (today.getTime() - dateValues[0] > msInDay) {
            return 0;
        }

        streak = 1;
        for (let i = 0; i < dateValues.length - 1; i++) {
            const diff = dateValues[i] - dateValues[i + 1];
            if (diff === msInDay) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const updateRoutine = async (newRoutine: RoutineType) => {
        setRoutine(newRoutine);
        try {
            await AsyncStorage.setItem(ROUTINE_KEY, JSON.stringify(newRoutine));
        } catch (e) {
            console.error('Failed to save routine', e);
        }
    };

    const addDayToRoutine = async (title: string, subtitle: string) => {
        const newId = `dia${routine.length + 1}`;
        const newDay = {
            id: newId,
            title,
            subtitle,
            exercises: []
        };
        const newRoutine = [...routine, newDay];
        await updateRoutine(newRoutine);
        return newId;
    };

    const addExerciseToDay = async (dayId: string, name: string, sets: string | number, reps: string) => {
        const targetDay = routine.find(d => d.id === dayId);
        if (!targetDay) return;

        const newExercise = {
            id: `ex_${Date.now()}`,
            name,
            sets,
            reps,
            notes: ''
        };

        const newRoutine = routine.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    exercises: [...day.exercises, newExercise]
                };
            }
            return day;
        });

        await updateRoutine(newRoutine);
    };

    const deleteDayFromRoutine = async (dayId: string) => {
        // Can't delete the only day
        if (routine.length <= 1) return false;

        const newRoutine = routine.filter(day => day.id !== dayId);
        await updateRoutine(newRoutine);

        // Remove day from progress just to clean up (optional but good)
        const newProgress = { ...progress };
        delete newProgress[dayId];
        setProgress(newProgress);
        try {
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
        } catch (e) {
            console.error('Failed to cleanup progress for deleted day');
        }

        return true;
    };

    const deleteExerciseFromDay = async (dayId: string, exerciseId: string) => {
        const newRoutine = routine.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    exercises: day.exercises.filter(ex => ex.id !== exerciseId)
                };
            }
            return day;
        });

        await updateRoutine(newRoutine);
    };

    const deleteWeightLog = async (logId: string) => {
        const newLogs = weightLogs.filter(log => log.id !== logId);
        setWeightLogs(newLogs);
        try {
            await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
        } catch (e) {
            console.error('Failed to delete weight log', e);
        }
    };

    const deleteSession = async (dateStr: string) => {
        const newDates = sessionDates.filter(d => d !== dateStr);
        setSessionDates(newDates);
        try {
            await AsyncStorage.setItem(SESSION_DATES_KEY, JSON.stringify(newDates));
        } catch (e) {
            console.error('Failed to delete session date', e);
        }
    };

    return {
        routine,
        progress,
        weightLogs,
        sessionDates,
        isLoading,
        toggleExercise,
        logWeight,
        logBodyWeight,
        resetProgress,
        finishSession,
        getCurrentStreak,
        updateRoutine,
        addDayToRoutine,
        addExerciseToDay,
        deleteDayFromRoutine,
        deleteExerciseFromDay,
        deleteWeightLog,
        deleteSession
    };
};
