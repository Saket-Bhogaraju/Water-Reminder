export interface WaterLog {
  id: string;
  amountMl: number;
  timestamp: string; // ISO string
}

export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'in';
export type DrinkUnit = 'ml' | 'oz';

export interface UserProfile {
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  conditions: string[];
  otherCondition: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  calculatedGoalMl: number;
  isCompletedOnboarding: boolean;
  agreedDisclaimer: boolean;
}

export interface AppPreferences {
  reminderStart: string; // "HH:MM" format, e.g. "08:00"
  reminderEnd: string;   // "HH:MM" format, e.g. "22:00"
  intervalMinutes: number; // 30, 60, 90, 120
  unitPreference: DrinkUnit;
  isNotificationEnabled: boolean;
  manualGoalOverride: boolean;
  overriddenGoalMl: number;
}
