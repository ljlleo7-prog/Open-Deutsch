import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import Exercises from './pages/Exercises';
import Onboarding from './pages/Onboarding';

import Reading from './pages/Reading';

import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import { I18nProvider } from './contexts/I18nProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import { CourseMap } from './pages/CourseMap';
import { LessonView } from './pages/LessonView';
import { BlockView } from './pages/BlockView';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/course" element={<CourseMap />} />
              <Route path="/lesson/:lessonId" element={<LessonView />} />
              <Route path="/lesson/:lessonId/block/:blockId" element={<BlockView />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Routes>
          </Layout>
        </Router>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
