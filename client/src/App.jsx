import { useEffect, useState } from 'react';
import $ from 'jquery';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PeoplePage from './pages/PeoplePage';
import UserProfilePage from './pages/UserProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import GroupsPage from './pages/GroupsPage';
import GroupPage from './pages/GroupPage';
import { getMe, logout } from './api/authApi';
import { notify } from './jquery/notify';

// Pages that a guest (not logged in) is allowed to see
const GUEST_PAGES = ['login', 'register'];

// Navigation is a simple state: which page is shown + its params
// (for example { userId } for a user profile). No router library.
function App() {
  const [user, setUser] = useState(null);           // logged-in user, or null
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState('home');
  const [params, setParams] = useState({});

  function navigate(newPage, newParams = {}) {
    setPage(newPage);
    setParams(newParams);
  }

  // When the app starts, ask the server if we already have a session.
  // Note: $.ajax returns a jqXHR, not a native Promise (it has no .finally),
  // so we always use it with await + try/catch/finally.
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    }
    checkSession();
  }, []);

  // [REQ-25 jQuery] If ANY request returns 401 (session expired / logged out),
  // forget the user so the login page is shown.
  useEffect(() => {
    function handleAjaxError(event, xhr) {
      if (xhr.status === 401) setUser(null);
    }
    $(document).on('ajaxError', handleAjaxError);
    return () => $(document).off('ajaxError', handleAjaxError);
  }, []);

  function handleLoggedIn(loggedInUser) {
    setUser(loggedInUser);
    navigate('home');
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // even if the request failed, log out on the client side
    }
    setUser(null);
    navigate('login');
    notify('You have been logged out', 'info');
  }

  function handleAccountDeleted() {
    setUser(null);
    navigate('login');
  }

  if (!authChecked) {
    return <p className="muted center">Loading...</p>;
  }

  // Guests can only see the login and register pages
  const currentPage = !user && !GUEST_PAGES.includes(page) ? 'login' : page;

  function renderPage() {
    if (!user) {
      return currentPage === 'register'
        ? <RegisterPage onLoggedIn={handleLoggedIn} onNavigate={navigate} />
        : <LoginPage onLoggedIn={handleLoggedIn} onNavigate={navigate} />;
    }

    switch (currentPage) {
      case 'groups':
        return <GroupsPage user={user} onNavigate={navigate} />;
      case 'group':
        // key: a different groupId creates a fresh GroupPage
        return <GroupPage key={params.groupId} groupId={params.groupId} user={user} onNavigate={navigate} />;
      case 'people':
        return <PeoplePage onNavigate={navigate} />;
      case 'user':
        return <UserProfilePage userId={params.userId} onNavigate={navigate} />;
      case 'myProfile':
        return <MyProfilePage onUserUpdated={setUser} onAccountDeleted={handleAccountDeleted} />;
      default:
        return <HomePage user={user} />;
    }
  }

  return (
    <div className="app">
      <NavBar user={user} page={currentPage} onNavigate={navigate} onLogout={handleLogout} />
      <main className="app-main">{renderPage()}</main>
    </div>
  );
}

export default App;
