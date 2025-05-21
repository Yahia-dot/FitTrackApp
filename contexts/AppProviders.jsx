import React from 'react';
import { UserProvider } from './UserContext';
import { UserProfilesProvider } from './UserProfilesContext';
import { UserSettingsProvider } from './UserSettingsContext';
import { WorkoutPlansProvider } from './WorkoutPlansContext';
import { WorkoutSchedulesProvider } from './WorkoutSchedulesContext';
import { WorkoutProgressProvider } from './WorkoutProgressContext';
import { NutritionPlansProvider } from './NutritionPlansContext';
import { MealSchedulesProvider } from './MealSchedulesContext';
import { MealsProvider } from './MealsContext';
import { ExercisesProvider } from './ExercisesContext';

export function AppProviders({ children }) {
    return (
        <UserProvider>
            <UserProfilesProvider>
                <UserSettingsProvider>

                    {children}

                </UserSettingsProvider>
            </UserProfilesProvider>
        </UserProvider>
    );
}