
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface HealthLog {
  id: string;
  timestamp: number;
  type: 'hydration' | 'pain' | 'medication' | 'energy' | 'symptom';
  value: any;
  note?: string;
}

export interface MauraProfile {
  name: string;
  hobbies: string[];
  dreams: string[];
  triggers: string[];
  medications: string[];
  responseStyle: 'normal' | 'terapeuta' | 'amiga' | 'coach' | 'direta';
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface AppState {
  profile: MauraProfile;
  healthLogs: HealthLog[];
  chatHistory: Message[];
}
