/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

import { store, RootState } from './store';
import { auth, db, handleFirestoreError } from './lib/firebase';
import { setUser, setProfile, setLoading } from './store/slices/authSlice';
import { User, UserProfile } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupProfilePage from './pages/SetupProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LogFoodPage from './pages/LogFoodPage';
import ProfilePage from './pages/ProfilePage';
import ComparisonPage from './pages/ComparisonPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ChatbotWidget from './components/ChatbotWidget';

const queryClient = new QueryClient();

function AppContent() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous listeners if any
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (firebaseUser) {
        // Fetch user doc
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.email === 'venkatasaiaravinds@gmail.com') {
            userData.role = 'admin';
          }
          dispatch(setUser(userData));
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'venkatasaiaravinds@gmail.com' ? 'admin' : 'user',
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          dispatch(setUser(newUser));
        }

        // Listen to profile
        profileUnsub = onSnapshot(
          doc(db, 'userProfiles', firebaseUser.uid), 
          (doc) => {
            if (doc.exists()) {
              dispatch(setProfile(doc.data() as UserProfile));
            }
          },
          (error) => {
            // Only report if still authenticated to avoid race condition noise on logout
            if (auth.currentUser) {
              handleFirestoreError(error, 'get', `userProfiles/${firebaseUser.uid}`);
            }
          }
        );
      } else {
        dispatch(setUser(null));
        dispatch(setProfile(null));
      }
      dispatch(setLoading(false));
    });

    return () => {
      unsubscribeAuth();
      if (profileUnsub) profileUnsub();
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-green-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Auth Required Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/setup-profile" element={<SetupProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/log-food" element={<LogFoodPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {user && <ChatbotWidget />}
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
