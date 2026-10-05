// Top navigation. Shows different links for guests and logged-in users.
function NavBar({ user, page, onNavigate, onLogout }) {
  function link(target, text) {
    return (
      <button
        className={'nav-link' + (page === target ? ' active' : '')}
        onClick={() => onNavigate(target)}
      >
        {text}
      </button>
    );
  }

  return (
    <header className="app-header">
      <h1 className="logo">StudyConnect</h1>
      <nav className="nav">
        {user ? (
          <>
            {link('home', 'Home')}
            {link('posts', 'Posts')}
            {link('groups', 'Groups')}
            {link('people', 'People')}
            {link('sketch', 'Sketch')}
            {link('stats', 'Statistics')}
            {link('myProfile', 'My Profile')}
            <span className="nav-user">@{user.username}</span>
            <button className="nav-link" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            {link('login', 'Login')}
            {link('register', 'Register')}
          </>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
