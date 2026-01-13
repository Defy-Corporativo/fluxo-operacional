import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@iadefysolutions/design-system';

import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Settings from './components/settings/Settings';
import FrentesEstrategicas from './components/frentes/FrentesEstrategicas';
import TarefasView from './components/tarefas/TarefasView';
import Acompanhamento from './components/acompanhamento/Acompanhamento';
import DebugLogViewer from './components/debug/DebugLogViewer';

const App = () => {
    return (
        <ThemeProvider defaultTheme="light">
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<FrentesEstrategicas />} />
                            <Route path="frentes" element={<FrentesEstrategicas />} />
                            <Route path="tarefas" element={<TarefasView />} />
                            <Route path="acompanhamento" element={<Acompanhamento />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </Router>
                <DebugLogViewer />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

