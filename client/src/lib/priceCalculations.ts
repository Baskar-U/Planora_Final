/**
 * Centralized price calculation utilities
 * Handles both old and new pricing structures
 */

export interface MealPricing {
  original?: number;
  price?: number;
  discounted?: number;
  originalPrice?: number;
  discount?: number;
}

export interface PackageData {
  id?: string;
  name?: string;
  packageName?: string;
  originalPrice?: number;
  price?: number;
  discount?: number;
  meals?: {
    breakfast?: MealPricing;
    lunch?: MealPricing;
    dinner?: MealPricing;
  };
  capacity?: number;
  priceUnit?: string;
}

export interface BookingData {
  totalAmount?: number;
  selectedMeals?: { [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } };
  negotiatedPrice?: number;
  userBudget?: number;
  convenienceFee?: number;
  isNegotiated?: boolean;
}

/**
 * Calculate total amount for packages with proper meal-based pricing
 * @param packages Array of packages
 * @param booking Optional booking data for meal selections and stored total
 * @returns Total amount
 */
export const calculatePackageTotal = (packages: PackageData[], booking?: BookingData): number => {
  // Always prioritize the stored totalAmount from booking data
  if (booking?.totalAmount && booking.totalAmount > 0) {
    return booking.totalAmount;
  }
  
  if (!packages || !Array.isArray(packages) || packages.length === 0) {
    return 0;
  }
  
  return packages.reduce((sum, pkg) => {
    // For catering packages with meals
    if (pkg.meals && booking?.selectedMeals && booking.selectedMeals[pkg.id || '']) {
      const selection = booking.selectedMeals[pkg.id || ''];
      let packageTotal = 0;
      
      if (selection.breakfast && pkg.meals.breakfast) {
        packageTotal += getMealPrice(pkg.meals.breakfast);
      }
      if (selection.lunch && pkg.meals.lunch) {
        packageTotal += getMealPrice(pkg.meals.lunch);
      }
      if (selection.dinner && pkg.meals.dinner) {
        packageTotal += getMealPrice(pkg.meals.dinner);
      }
      
      return sum + packageTotal;
    }
    
    // For non-catering packages or fallback
    const originalPrice = pkg.originalPrice || pkg.price || 0;
    const discount = pkg.discount || 0;
    const finalPrice = originalPrice - (originalPrice * discount / 100);
    return sum + finalPrice;
  }, 0);
};

/**
 * Get the correct price for a meal (handles different pricing structures)
 * @param meal Meal pricing data
 * @returns Price to use
 */
export const getMealPrice = (meal: MealPricing): number => {
  return meal.original || meal.price || meal.discounted || meal.originalPrice || 0;
};

/**
 * Calculate total with convenience fee
 * @param subtotal Base amount
 * @param convenienceFeePercent Convenience fee percentage (default 1%)
 * @returns Object with subtotal, convenience fee, and total
 */
export const calculateWithConvenienceFee = (subtotal: number, convenienceFeePercent: number = 1) => {
  const convenienceFee = Math.round(subtotal * convenienceFeePercent / 100);
  const total = subtotal + convenienceFee;
  
  return {
    subtotal,
    convenienceFee,
    total
  };
};

/**
 * Get meal selection summary for display
 * @param selectedMeals Selected meals data
 * @param packageId Package ID
 * @returns Human-readable summary
 */
export const getMealSummary = (selectedMeals: { [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } } | undefined, packageId: string): string => {
  const selection = selectedMeals?.[packageId];
  if (!selection) return 'All meals';
  
  const selectedMealsList = [];
  if (selection.breakfast) selectedMealsList.push('Breakfast');
  if (selection.lunch) selectedMealsList.push('Lunch');
  if (selection.dinner) selectedMealsList.push('Dinner');
  
  return selectedMealsList.length > 0 ? selectedMealsList.join(', ') : 'No meals selected';
};




