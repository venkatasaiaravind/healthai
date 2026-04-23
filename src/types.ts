/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  createdAt: any;
  lastLogin: any;
}

export interface UserProfile {
  uid: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalType: 'lose_weight' | 'maintain' | 'gain_muscle';
  healthConditions: string[];
  allergies: string[];
  dietaryPreference: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
  updatedAt: any;
}

export interface NutritionFacts {
  servingSize: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  sugar: number;
  fat: number;
  saturatedFat: number;
  transFat: number;
  sodium: number;
  fiber: number;
  vitamins: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageURL: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  isFdaApproved: boolean;
  isFssaiApproved: boolean;
  ingredientsText: string;
  nutritionFacts: NutritionFacts;
  healthScore: number;
  healthCategory: 'Healthy' | 'Moderate' | 'Caution Required';
  healthBadges: string[];
  scoreExplanation: {
    positives: string[];
    negatives: string[];
    summary: string;
  };
  sellerId: string;
  sellerName: string;
  tags: string[];
  createdAt: any;
  updatedAt: any;
  averageRating?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageURL: string;
  healthScore: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cod' | 'upi' | 'card';
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface FoodLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: any;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: any;
  suggestedProducts?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  intent: string;
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}
