import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Teacher from './pages/Teacher';
import Student from './pages/Student';

function App(){
  return (
    <BrowserRouter>
      <nav>
        <Link to="/teacher">Teacher</Link> | <Link to="/student">Student</Link>
      </nav>
      <Routes>
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/student" element={<Student />} />
        <Route path="/" element={<div>Open /teacher or /student</div>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
