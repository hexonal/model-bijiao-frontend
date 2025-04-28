import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import ModelList from './pages/ModelManagement/ModelList';
import ModelForm from './pages/ModelManagement/ModelForm';
import TestCaseList from './pages/TestCase/TestCaseList';
import TestCaseForm from './pages/TestCase/TestCaseForm';
import TestCaseView from './pages/TestCase/TestCaseView';
import Evaluation from './pages/Evaluation';
import TaskList from './pages/Task/TaskList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Model Management */}
          <Route path="models" element={<ModelList />} />
          <Route path="models/new" element={<ModelForm />} />
          <Route path="models/edit/:id" element={<ModelForm />} />
          
          {/* Test Cases */}
          <Route path="test-cases" element={<TestCaseList />} />
          <Route path="test-cases/new" element={<TestCaseForm />} />
          <Route path="test-cases/edit/:id" element={<TestCaseForm />} />
          <Route path="test-cases/view/:id" element={<TestCaseView />} />
          
          {/* Evaluation */}
          <Route path="evaluation" element={<Evaluation />} />
          
          {/* Tasks */}
          <Route path="tasks" element={<TaskList />} />
          
          {/* Settings */}
          <Route path="settings" element={<ModelList />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;