export type Exercise = {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    notes?: string;
    rpe?: number;
};

export type DayRoutine = {
    id: string;
    title: string;
    subtitle: string;
    exercises: Exercise[];
};

export type RoutineType = DayRoutine[];

export type SessionProgress = {
    [dayId: string]: {
        completedExercises: string[];
    };
};

export type WeightLog = {
    id: string;
    exerciseId: string; // 'bodyweight' for body weight
    weight: number;
    reps?: number;
    date: string;
    type: 'lift' | 'body';
};

export const initialRoutine: RoutineType = [
    {
        id: 'dia1',
        title: 'Día 1: Fuerza',
        subtitle: 'Sesión de Empuje',
        exercises: [
            { id: 'sentadilla', name: 'Sentadilla Barra', sets: 3, reps: '6-8', notes: 'Talones clavados, core rígido.' },
            { id: 'banca', name: 'Press de Banca', sets: 3, reps: '6-8', notes: 'Escápulas retraídas (pecho fuera).' },
            { id: 'dominadas', name: 'Dominadas', sets: 3, reps: 'Fallo', notes: 'Colgado activo (hombros abajo).' },
            { id: 'curl', name: 'Curl Barra W', sets: 3, reps: '12', notes: 'Controlar el descenso.' },
            { id: 'farmers', name: 'Farmer\'s Walk', sets: 3, reps: '40m', notes: 'Espalda recta, mirada al frente.' },
            { id: 'legraises', name: 'Leg Raises (Extra)', sets: 2, reps: '12', notes: 'Colgado para descompresión.' },
        ]
    },
    {
        id: 'dia2',
        title: 'Día 2: Poder',
        subtitle: 'Sesión Explosiva',
        exercises: [
            { id: 'pesomuerto', name: 'Peso Muerto', sets: 3, reps: '5', notes: 'Espalda neutra, empuje de pierna.' },
            { id: 'pushpress', name: 'Push Press', sets: 3, reps: '6', notes: 'Explosivo desde las piernas.' },
            { id: 'saltoscajon', name: 'Saltos Cajón', sets: 4, reps: '5', notes: 'Aterrizaje suave (silencioso).' },
            { id: 'remo', name: 'Remo con Discos', sets: 3, reps: '10', notes: 'Apretar espalda media al final.' },
            { id: 'curl2', name: 'Curl Barra W', sets: 2, reps: '12', notes: 'Bombeo final de brazo.' },
            { id: 'facepulls', name: 'Face Pulls (Extra)', sets: 3, reps: '15', notes: 'Para abrir hombros.' },
        ]
    },
    {
        id: 'dia3',
        title: 'Día 3: Resiliencia',
        subtitle: 'Sesión de Estabilidad',
        exercises: [
            { id: 'estocadas', name: 'Estocadas (Man.)', sets: 3, reps: '10/p', notes: 'Estira el psoas en cada paso.' },
            { id: 'dips', name: 'Dips (Fondos)', sets: 3, reps: '10-12', notes: 'Pecho inclinado (fuerza empuje).' },
            { id: 'powerclean', name: 'Power Clean / KB', sets: 4, reps: '8', notes: 'Extensión total de cadera.' },
            { id: 'plancha', name: 'Plancha c/ Peso', sets: 3, reps: '45s', notes: 'No dejes que caiga la lumbar.' },
            { id: 'deadhang', name: 'Dead Hang (Extra)', sets: 3, reps: '45s', notes: 'Relajar columna.' },
        ]
    }
];
