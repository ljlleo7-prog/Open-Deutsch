import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Level, Stage, Lesson, UserXP } from '../types';

export const CourseMap: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [stages, setStages] = useState<Stage[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [userXP, setUserXP] = useState<UserXP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const levelsData = await api.getLevels();
        setLevels(levelsData);
        if (levelsData.length > 0) {
            setSelectedLevel(levelsData[0].id); // Default to first level
        }
        
        const xpData = await api.getUserXP();
        if (xpData) setUserXP(xpData);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchStagesAndLessons() {
      if (!selectedLevel) return;
      setLoading(true);
      try {
        const stagesData = await api.getStages(selectedLevel);
        setStages(stagesData);

        const lessonsMap: Record<string, Lesson[]> = {};
        for (const stage of stagesData) {
          const lessonsData = await api.getLessons(stage.id);
          lessonsMap[stage.id] = lessonsData;
        }
        setLessons(lessonsMap);
      } catch (e) {
        console.error("Failed to fetch stages/lessons", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStagesAndLessons();
  }, [selectedLevel]);

  const getTotalXP = () => userXP.reduce((sum, item) => sum + item.amount, 0);
  const currentLevelData = levels.find(l => l.id === selectedLevel);
  const totalXP = getTotalXP();
  const targetXP = currentLevelData?.total_xp_target || 1000;
  const progressPercent = Math.min(100, (totalXP / targetXP) * 100);
  const canAdvance = progressPercent >= 80;

  if (loading && levels.length === 0) return <div className="p-8 text-center">Loading course map...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Course Map</h1>
      
      {/* Level Selector */}
      <div className="flex justify-center mb-8 gap-4 flex-wrap">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              selectedLevel === level.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {level.name}
          </button>
        ))}
      </div>

      {/* XP Progress for Level */}
      {currentLevelData && (
          <div className="max-w-4xl mx-auto mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-700">Level Progress</h3>
                  <span className="text-sm font-medium text-gray-500">{totalXP} / {targetXP} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                  ></div>
              </div>
              <div className="text-right">
                  {canAdvance ? (
                      <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-md transition-colors animate-pulse">
                          Take Advancement Test
                      </button>
                  ) : (
                      <span className="text-sm text-gray-400 italic">
                          Reach 80% to unlock Advancement Test
                      </span>
                  )}
              </div>
          </div>
      )}

      {/* Stages List */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{stage.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{stage.description}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons[stage.id]?.map((lesson) => (
                <Link 
                  to={`/lesson/${lesson.id}`} 
                  key={lesson.id}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase">
                      {lesson.type}
                    </span>
                    {/* Placeholder for status icon */}
                    <span className="text-gray-300 group-hover:text-blue-500">★</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{lesson.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{lesson.description}</p>
                </Link>
              ))}
              {(!lessons[stage.id] || lessons[stage.id].length === 0) && (
                <div className="col-span-full text-center py-8 text-gray-400 italic">
                  No lessons available in this stage yet.
                </div>
              )}
            </div>
          </div>
        ))}
        {stages.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">
                No stages found for this level. (Database might need seeding)
            </div>
        )}
      </div>
    </div>
  );
};
