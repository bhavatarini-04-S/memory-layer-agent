import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Upload from "./pages/Upload";
import FileDetails from "./pages/FileDetails";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/file-details" element={<FileDetails />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;