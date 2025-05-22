import { ID, Permission, Role } from "appwrite"
import { databases } from "../lib/appwrite"
import Constants from "expo-constants"

const {
    appwriteDatabaseId,
    mealSchedules,
    meals,
} = Constants.expoConfig.extra

/**
 * Get a Date object representing the date of a specific weekday in the current week
 * @param {number} weekday - 0 (Sunday) to 6 (Saturday)
 */
function getDateForWeekday(weekday) {
    const today = new Date()
    const currentWeekday = today.getDay()
    const diff = weekday - currentWeekday
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + diff)
    return targetDate.toISOString().split("T")[0]
}

/**
 * Select a balanced set of meals per day (e.g., 3 meals = 1 breakfast, 1 lunch, 1 dinner)
 * @param {Object} filteredMeals - filtered meals { breakfast: [...], lunch: [...], dinner: [...] }
 * @param {number} count - how many meals to pick
 */
function selectBalancedMeals(filteredMeals, count) {
    const result = []
    const types = Object.keys(filteredMeals)

    let i = 0
    while (result.length < count) {
        const type = types[i % types.length]
        const list = filteredMeals[type]

        if (list && list.length > 0) {
            const meal = list.shift() // remove from pool to avoid reuse
            result.push({ ...meal, type })
        }

        i++
        if (i > 20) break // safety exit
    }

    return result
}

/**
 * Generate a full 7-day meal plan and store it in Appwrite
 * @param {Object} options
 * @param {Object} options.plan - Nutrition plan document (must contain $id, mealsPerDay)
 * @param {Object} options.filteredMeals - Meals filtered by goal and avoid list
 * @param {Object} options.user - User object (must contain $id)
 */
export async function generateMealPlan({ plan, filteredMeals, user }) {
    const userId = user.$id

    for (let day = 0; day < 7; day++) {
        const date = getDateForWeekday(day)

        // 1. Create MealSchedule for the day
        const schedule = await databases.createDocument(
            appwriteDatabaseId,
            mealSchedules,
            ID.unique(),
            {
                nutritionPlanId: plan.$id,
                dayOfWeek: day,
                date: date,
            },
            [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ]
        )

        // 2. Pick N meals for the day
        const clone = JSON.parse(JSON.stringify(filteredMeals));
        const selectedMeals = selectBalancedMeals(clone, plan.mealsPerDay);


        // 3. Create Meals linked to the schedule
        for (const meal of selectedMeals) {
            await databases.createDocument(
                appwriteDatabaseId,
                meals,
                ID.unique(),
                {
                    mealScheduleId: schedule.$id,
                    title: meal.title,
                    type: meal.type,
                    calories: meal.calories,
                    ingredients: meal.ingredients.join(", "),
                    instructions: Array.isArray(meal.instructions)
                        ? meal.instructions.join("\n")
                        : meal.instructions, // ✅ converted to string
                    image: meal.image,
                    isEaten: false,
                    time: null,
                },
                [
                    Permission.read(Role.user(userId)),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ]
            )
        }
    }
}
