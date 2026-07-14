import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHcps } from './store/hcpSlice';
import { fetchInteractions } from './store/interactionSlice';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LogInteractionForm from './components/LogInteractionForm';
import ChatInterface from './components/ChatInterface';
import InteractionHistory from './components/InteractionHistory';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { inputMode } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div className="app">
      <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1>Log Interaction</h1>
            <p>Record your interactions with Healthcare Professionals</p>
          </div>
          <div className="content-area">
            <div className="interaction-panel">
              {inputMode === 'form' ? <LogInteractionForm /> : <ChatInterface />}
            </div>
            <div className="history-panel">
              <InteractionHistory />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
