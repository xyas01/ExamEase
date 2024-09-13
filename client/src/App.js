import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CreateExam from './pages/CreateExam';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Exam from './pages/Exam';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:id" element={<Home />} />
          <Route path="/exam/:id" element={<Exam />} />
          <Route path="/createexam/:id" element={<CreateExam />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
