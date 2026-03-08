import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Carregando...');

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then((res) => res.json())
      .then((data) => setStatus(`Backend: ${data.status}`))
      .catch(() => setStatus('Backend indisponivel'));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>RCP Data Imob</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
