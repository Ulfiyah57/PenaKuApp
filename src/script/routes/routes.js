import RegisterPage from '../pages/auth/register/register-pg';
import LoginPage from '../pages/auth/login/login-pg';
import HomePage from '../pages/home/home-pg';
import bookmarkpage from '../pages/markedbook/bookmark-pg';
import NewstoriesPage from '../pages/addnew/add-new-pg';
import { enforceLoginForProtectedRoute, restrictAccessIfAuthenticated } from '../utils/auth';
import storiesDetailPage from '../pages/stories-detail/stories-detail-pg'; 

export const routes = {
  '/login': () => restrictAccessIfAuthenticated(new LoginPage()),
  '/register': () => restrictAccessIfAuthenticated(new RegisterPage()),

  '/': () => enforceLoginForProtectedRoute(new HomePage()),
  '/new': () => enforceLoginForProtectedRoute(new NewstoriesPage()),
  '/bookmark': () => enforceLoginForProtectedRoute(new bookmarkpage()),
  '/listStory/:id': () => enforceLoginForProtectedRoute(new storiesDetailPage()),
};


