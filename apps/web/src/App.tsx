import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMe } from '@/store/slices/authSlice';
import { initTheme } from '@/store/slices/themeSlice';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { EmployeesPage } from '@/pages/employees/EmployeesPage';
import { AttendancePage } from '@/pages/attendance/AttendancePage';
import { LeavesPage } from '@/pages/leaves/LeavesPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { PayrollPage } from '@/pages/payroll/PayrollPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { RolesPage } from '@/pages/admin/RolesPage';
import { SubscriptionsPage } from '@/pages/subscriptions/SubscriptionsPage';
import { CompanyBrandingPage } from '@/pages/company/CompanyBrandingPage';
import { ROLES } from '@crm/shared';
import { useSocket } from '@/hooks/useSocket';

function AppRoutes() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMe());
    }
  }, [dispatch, accessToken]);

  useSocket();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="employees"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route
          path="payroll"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HR]}>
              <PayrollPage />
            </ProtectedRoute>
          }
        />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route
          path="reports"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MANAGER]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/roles"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="subscriptions"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN]}>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="company/branding"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HR]}>
              <CompanyBrandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HR]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </Provider>
  );
}
