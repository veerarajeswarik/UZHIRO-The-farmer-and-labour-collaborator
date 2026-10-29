import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import PageLoading from './components/PageLoading';

// Route-level code splitting: each page ships as its own chunk, fetched only
// when a user actually navigates there. This matters most for the admin
// section (7 pages) which the vast majority of users - farmers and
// labourers - never load at all.
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FarmerProfilePage = lazy(() => import('./pages/FarmerProfilePage'));
const CropSelection = lazy(() => import('./pages/CropSelection'));
const CropDetail = lazy(() => import('./pages/CropDetail'));
const CropComparison = lazy(() => import('./pages/CropComparison'));
const CostProfitEstimator = lazy(() => import('./pages/CostProfitEstimator'));
const InputChecklist = lazy(() => import('./pages/InputChecklist'));
const LabourMarketplace = lazy(() => import('./pages/LabourMarketplace'));
const LabourerDetail = lazy(() => import('./pages/LabourerDetail'));
const MyHiringRequests = lazy(() => import('./pages/MyHiringRequests'));
const LabourerProfilePage = lazy(() => import('./pages/LabourerProfilePage'));
const Weather = lazy(() => import('./pages/Weather'));
const FarmPlanner = lazy(() => import('./pages/FarmPlanner'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const GovernmentSchemes = lazy(() => import('./pages/GovernmentSchemes'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCrops = lazy(() => import('./pages/admin/AdminCrops'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminMarketPrices = lazy(() => import('./pages/admin/AdminMarketPrices'));
const AdminLearning = lazy(() => import('./pages/admin/AdminLearning'));
const AdminSchemes = lazy(() => import('./pages/admin/AdminSchemes'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Full route map for the platform, built up phase by phase. MainLayout,
 * ProtectedRoute and AuthProvider stay in the main bundle (needed on every
 * page); everything else is code-split per route (see the lazy imports
 * above) and wrapped in one Suspense boundary with a shared loading state.
 */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoading />}>
            <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/farmer/profile"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <FarmerProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/crops"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <CropSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crops/compare"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <CropComparison />
                  </ProtectedRoute>
                }
              />
              <Route path="/crops/:id" element={<CropDetail />} />

              <Route
                path="/profit"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <CostProfitEstimator />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inputs"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <InputChecklist />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/labourer/profile"
                element={
                  <ProtectedRoute roles={['labourer']}>
                    <LabourerProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/labourers"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <LabourMarketplace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labourers/:id"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <LabourerDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hiring"
                element={
                  <ProtectedRoute roles={['farmer', 'labourer']}>
                    <MyHiringRequests />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/weather"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <Weather />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/planner"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <FarmPlanner />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assistant"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <AiAssistant />
                  </ProtectedRoute>
                }
              />

              <Route path="/learning" element={<LearningHub />} />
              <Route path="/learning/:id" element={<ArticleDetail />} />
              <Route path="/schemes" element={<GovernmentSchemes />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="crops" element={<AdminCrops />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="market-prices" element={<AdminMarketPrices />} />
                <Route path="learning" element={<AdminLearning />} />
                <Route path="schemes" element={<AdminSchemes />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
