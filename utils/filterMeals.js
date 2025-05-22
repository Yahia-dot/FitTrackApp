/**
 * Filters the external meal library by user's fitness goal and foods to avoid.
 *
 * @param {Object} mealLibrary - The full meal JSON object (e.g., { breakfast: [...], lunch: [...], dinner: [...] })
 * @param {String} goal - The user's goal (e.g., "Build Muscle", "Lose Fat")
 * @param {String[]} avoidList - Array of ingredient keywords to avoid
 * @returns {Object} Filtered meal object with same structure as input
 */

export function filterMealsByPreferences(mealLibrary, goal, avoidList = []) {
  const avoidSet = new Set(avoidList.map(i => i.toLowerCase().trim()));

  // Optional: you can define goal-related tags if you want to expand this
  const goalTags = {
    "Build Muscle": ["protein", "chicken", "egg", "meat"],
    "Lose Fat": ["low-calorie", "vegetable", "salad"],
    "Maintain Weight": [], // no filtering
    "Improve Performance": ["carbs", "balanced", "rice"],
  };

  const tagSet = new Set(goalTags[goal] || []);

  // Result object with breakfast, lunch, dinner arrays
  const filtered = {};

  for (const [mealType, meals] of Object.entries(mealLibrary)) {
    filtered[mealType] = meals.filter(meal => {
      const ingredientsText = meal.ingredients.join(" ").toLowerCase();

      // Exclude meals with any avoid items
      const hasAvoided = [...avoidSet].some(item => ingredientsText.includes(item));
      if (hasAvoided) return false;

      // If no goal tags, allow all meals (e.g., Maintain Weight)
      if (tagSet.size === 0) return true;

      // Otherwise, allow meals that match goal tags (by ingredients)
      return [...tagSet].some(tag => ingredientsText.includes(tag));
    });
  }

  return filtered;
}
