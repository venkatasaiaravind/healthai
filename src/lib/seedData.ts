import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = [
  'Supplements', 'Superfoods', 'Healthy Snacks', 'Beverages', 'Organic Grains', 
  'Plant-Based Protein', 'Health Drinks', 'Low-Calorie Snacks', 'Dried Fruits', 'Nut Butters'
];

const BRANDS = [
  'GreenLife', 'PureVeda', 'NutriStream', 'HealthRoots', 'OrganicZen', 
  'PowerUp', 'CleanBites', 'NatureFuel', 'VitalityPlus', 'EcoNature'
];

const ADJECTIVES = [
  'Premium', 'Organic', 'Natural', 'Pure', 'Vital', 'Whole', 'Ancient', 'Golden', 'Green', 'Active'
];

const NOUNS = [
  'Mix', 'Blend', 'Powder', 'Bar', 'Seed', 'Millet', 'Tea', 'Juice', 'Crunch', 'Protein'
];

const IMAGES = [
  'https://images.unsplash.com/photo-1544333346-64e4fe186063?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1540189567005-51c91ee585ee?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506084868730-342b23a89912?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1464305795204-6f5bdee7f81a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&q=80&w=800'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProduct(index: number) {
  const brand = getRandomItem(BRANDS);
  const name = `${getRandomItem(ADJECTIVES)} ${getRandomItem(NOUNS)} ${index + 1}`;
  const category = getRandomItem(CATEGORIES);
  const price = Math.floor(Math.random() * 2000) + 199;
  const healthScore = Math.floor(Math.random() * 40) + 60; // 60-100
  
  return {
    name,
    brand,
    category,
    description: `Expertly crafted ${name} by ${brand}. Perfect for maintaining a healthy lifestyle and boosting daily nutrition.`,
    imageURL: getRandomItem(IMAGES),
    price,
    stockQuantity: Math.floor(Math.random() * 100) + 20,
    isActive: true,
    isFdaApproved: Math.random() > 0.3,
    isFssaiApproved: true,
    ingredientsText: "Organic Grains, Natural Extracts, Vital Vitamins, Minerals, No Added Preservatives.",
    nutritionFacts: {
      servingSize: "100g",
      calories: Math.floor(Math.random() * 300) + 50,
      protein: Math.floor(Math.random() * 20) + 2,
      carbohydrates: Math.floor(Math.random() * 50) + 10,
      sugar: Math.floor(Math.random() * 10),
      fat: Math.floor(Math.random() * 15),
      saturatedFat: Math.floor(Math.random() * 5),
      transFat: 0,
      sodium: Math.floor(Math.random() * 100),
      fiber: Math.floor(Math.random() * 15) + 2,
      vitamins: "Vitamin A, C, D, E, B12"
    },
    healthScore,
    healthCategory: healthScore >= 85 ? 'Healthy' : healthScore >= 70 ? 'Moderate' : 'Caution Required',
    healthBadges: ['FSSAI Approved', 'High Protein', 'No Added Sugar'].slice(0, Math.floor(Math.random() * 3) + 1),
    scoreExplanation: {
      positives: ["High in protein", "Low in sodium", "Rich in dietary fiber"],
      negatives: ["Contains minor natural sugars"],
      summary: "A scientifically formulated nutrition blend for active individuals."
    },
    sellerId: "admin_seed",
    sellerName: "HealthAI Official",
    tags: [category.toLowerCase(), brand.toLowerCase(), 'health', 'organic'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    averageRating: (Math.random() * 2) + 3 // 3.0-5.0
  };
}

export async function seedProducts(count: number = 100) {
  console.log(`Starting seed of ${count} products...`);
  const productsRef = collection(db, 'products');
  let successCount = 0;

  for (let i = 0; i < count; i++) {
    try {
      const product = generateProduct(i);
      await addDoc(productsRef, product);
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`Seeded ${successCount} products...`);
      }
    } catch (error) {
      console.error(`Error seeding product ${i}:`, error);
    }
  }

  console.log(`Finished seeding. Successfully added ${successCount} products.`);
  return successCount;
}
