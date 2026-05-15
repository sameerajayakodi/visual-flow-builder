import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import { FlowBuilder } from './components/builder';
import Reporting from './components/reporting/Reporting';
import Configuration from './components/configuration/Configuration';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<FlowBuilder />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/configuration" element={<Configuration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
