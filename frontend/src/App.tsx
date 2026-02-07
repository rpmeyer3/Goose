import { Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
    </Routes>
  );
}

export default App;