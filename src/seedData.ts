import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Product } from './types';

export const sampleProducts: Partial<Product>[] = [
  {
    name: "PrettyNutty Healthy Nutmix 500g",
    brand: "PrettyNutty",
    category: "Superfoods",
    price: 324,
    healthScore: 90,
    healthBadges: ["High Protein", "Heart Healthy", "Low Sugar"],
    isFssaiApproved: true,
    isFdaApproved: true,
    description: "A perfect blend of roasted nuts and seeds for a healthy snack.",
    imageURL: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1000&auto=format&fit=crop",
    tags: ["nuts", "superfood", "healthy", "protein"],
    isActive: true,
    stockQuantity: 100,
    nutritionFacts: {
      servingSize: "30g",
      calories: 160,
      protein: 6,
      carbohydrates: 5,
      sugar: 1,
      fat: 14,
      saturatedFat: 2,
      transFat: 0,
      sodium: 150,
      fiber: 3,
      vitamins: "B6, E, Magnesium"
    },
    scoreExplanation: {
      positives: ["High protein content", "Rich in healthy fats", "No added sugar"],
      negatives: ["Moderately high in sodium"],
      summary: "Excellent snack choice for mental focus and sustained energy."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Green Tea Extract",
    brand: "NutriWellness",
    category: "Herbal",
    price: 799,
    healthScore: 91,
    healthBadges: ["Organic", "Low Sugar", "Heart Healthy"],
    isFssaiApproved: true,
    isFdaApproved: true,
    description: "Pure green tea extract for metabolic support.",
    imageURL: "https://images.unsplash.com/photo-1544787210-2213d84ad9a0?q=80&w=1000&auto=format&fit=crop",
    tags: ["tea", "metabolism", "herbal", "weightloss"],
    isActive: true,
    stockQuantity: 50,
    nutritionFacts: {
      servingSize: "1 capsule",
      calories: 5,
      protein: 0,
      carbohydrates: 1,
      sugar: 0,
      fat: 0,
      saturatedFat: 0,
      transFat: 0,
      sodium: 0,
      fiber: 0,
      vitamins: "Vitamin C"
    },
    scoreExplanation: {
      positives: ["Zero calories", "High antioxidant count", "Zero sugar"],
      negatives: ["None significant"],
      summary: "Perfect for weight management and overall vitality."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Almond Butter",
    brand: "BioOrganics",
    category: "Superfoods",
    price: 599,
    healthScore: 88,
    healthBadges: ["High Protein", "Heart Healthy"],
    isFssaiApproved: true,
    isFdaApproved: false,
    description: "Stone-ground creamy almond butter with no added oils.",
    imageURL: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000&auto=format&fit=crop",
    tags: ["almond", "butter", "creamy", "healthy"],
    isActive: true,
    stockQuantity: 120,
    nutritionFacts: {
      servingSize: "32g",
      calories: 190,
      protein: 7,
      carbohydrates: 6,
      sugar: 1,
      fat: 17,
      saturatedFat: 1,
      transFat: 0,
      sodium: 0,
      fiber: 3,
      vitamins: "Calcium, Iron"
    },
    scoreExplanation: {
      positives: ["High protein", "Unsaturated fats", "No palm oil"],
      negatives: ["Calorically dense"],
      summary: "A nutritious spread for weight gain or active athletes."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Organic Protein Bar",
    brand: "NatureBox",
    category: "Protein",
    price: 599,
    healthScore: 72,
    healthBadges: ["High Protein"],
    isFssaiApproved: true,
    isFdaApproved: true,
    description: "Plant-based protein bar with chocolate chunks.",
    imageURL: "https://images.unsplash.com/photo-1622484211148-71649989d316?q=80&w=1000&auto=format&fit=crop",
    tags: ["bar", "protein", "organic", "chocolate"],
    isActive: true,
    stockQuantity: 500,
    nutritionFacts: {
      servingSize: "60g",
      calories: 220,
      protein: 20,
      carbohydrates: 25,
      sugar: 12,
      fat: 8,
      saturatedFat: 3,
      transFat: 0,
      sodium: 190,
      fiber: 5,
      vitamins: "B12"
    },
    scoreExplanation: {
      positives: ["High protein (20g)", "Organic ingredients"],
      negatives: ["High sugar content (12g)"],
      summary: "Good post-workout snack, but watch the sugar intake."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Vitamin D3 Supplement",
    brand: "HealthiVit",
    category: "Vitamins",
    price: 399,
    healthScore: 90,
    healthBadges: ["Diabetic Friendly"],
    isFssaiApproved: true,
    isFdaApproved: true,
    description: "High potency Vitamin D3 for bone health.",
    imageURL: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop",
    tags: ["vitamin", "d3", "bones", "health"],
    isActive: true,
    stockQuantity: 200,
    nutritionFacts: {
      servingSize: "1 tab",
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      sugar: 0,
      fat: 0,
      saturatedFat: 0,
      transFat: 0,
      sodium: 0,
      fiber: 0,
      vitamins: "Vitamin D3 (2000 IU)"
    },
    scoreExplanation: {
      positives: ["Essential nutrient", "Zero fillers", "Zero sugar"],
      negatives: ["None"],
      summary: "Vital for immunity and skeletal strength."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Whey Protein Isolate",
    brand: "MyProtein",
    category: "Protein",
    price: 2499,
    healthScore: 85,
    healthBadges: ["High Protein", "Low Sugar"],
    isFssaiApproved: true,
    isFdaApproved: true,
    description: "Pure whey isolate for muscle recovery.",
    imageURL: "https://images.unsplash.com/photo-1593095191071-887632b674b2?q=80&w=1000&auto=format&fit=crop",
    tags: ["whey", "protein", "muscle", "workout"],
    isActive: true,
    stockQuantity: 40,
    nutritionFacts: {
      servingSize: "25g",
      calories: 90,
      protein: 23,
      carbohydrates: 1,
      sugar: 0,
      fat: 0,
      saturatedFat: 0,
      transFat: 0,
      sodium: 50,
      fiber: 0,
      vitamins: "Amino Acids"
    },
    scoreExplanation: {
      positives: ["90% protein", "Low calorie", "Zero sugar"],
      negatives: ["Processed whey"],
      summary: "Cleanest protein source for lean muscle gain."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Omega-3 Fish Oil",
    brand: "NaturalBest",
    category: "Supplements",
    price: 449,
    healthScore: 87,
    healthBadges: ["Heart Healthy", "Diabetic Friendly"],
    isFssaiApproved: true,
    isFdaApproved: true,
    description: "Deep sea fish oil rich in EPA and DHA.",
    imageURL: "https://images.unsplash.com/photo-1559113513-d560960466a3?q=80&w=1000&auto=format&fit=crop",
    tags: ["omega3", "fishoil", "heart", "brain"],
    isActive: true,
    stockQuantity: 80,
    nutritionFacts: {
      servingSize: "1 capsule",
      calories: 10,
      protein: 0,
      carbohydrates: 0,
      sugar: 0,
      fat: 1,
      saturatedFat: 0,
      transFat: 0,
      sodium: 0,
      fiber: 0,
      vitamins: "Omega-3"
    },
    scoreExplanation: {
      positives: ["Brain health", "Anti-inflammatory", "Joint health"],
      negatives: ["Source quality varies"],
      summary: "Essential for heart health and cognitive function."
    },
    healthCategory: "Healthy"
  },
  {
    name: "Ashwagandha Root Powder",
    brand: "AyurLife",
    category: "Herbal",
    price: 349,
    healthScore: 82,
    healthBadges: ["Organic", "Herbal"],
    isFssaiApproved: true,
    isFdaApproved: false,
    description: "Traditional Ayurvedic herb for stress relief.",
    imageURL: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=1000&auto=format&fit=crop",
    tags: ["herbal", "stress", "ayurveda", "energy"],
    isActive: true,
    stockQuantity: 150,
    nutritionFacts: {
      servingSize: "3g",
      calories: 10,
      protein: 0,
      carbohydrates: 2,
      sugar: 0,
      fat: 0,
      saturatedFat: 0,
      transFat: 0,
      sodium: 0,
      fiber: 1,
      vitamins: "None"
    },
    scoreExplanation: {
      positives: ["Organic", "Adaptogenic properties"],
      negatives: ["Taste can be strong"],
      summary: "Excellent for stress management and cortisol reduction."
    },
    healthCategory: "Healthy"
  }
];

export const seedDatabase = async () => {
  try {
    const productsQuery = query(collection(db, 'products'), limit(1));
    const snapshot = await getDocs(productsQuery);
    
    if (snapshot.empty) {
      console.log("Seeding database with sample products...");
      for (const prod of sampleProducts) {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...prod,
          id: newDocRef.id,
          sellerId: "admin",
          sellerName: "HealthAI Official",
          createdAt: new Date(),
          updatedAt: new Date(),
          averageRating: 4.5
        });
      }
      
      // Seed admin user
      await setDoc(doc(db, 'users', 'admin_placeholder'), {
          uid: 'admin_placeholder',
          email: 'admin@healthai.com',
          displayName: 'HealthAI Admin',
          role: 'admin',
          createdAt: new Date(),
          lastLogin: new Date(),
      });
      
      console.log("Seeding complete.");
    }
  } catch (error) {
    console.debug("Seed check skipped or failed (likely insufficient permissions for non-admin):", error);
  }
};
