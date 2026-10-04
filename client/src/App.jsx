import HomePage from './pages/HomePage';

// Navigation between pages will be added here in Phase 2
// (a simple "page" state - no router library).
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">StudyConnect</h1>
      </header>
      <main className="app-main">
        <HomePage />
      </main>
    </div>
  );
}

export default App;
