import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { archetypeService } from '../utils/archetypes';

const ArchetypeWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get archetype info if available
  const archetypeInfo = user?.conflict_archetype 
    ? archetypeService.getArchetypeInfo(user.conflict_archetype) 
    : null;

  if (!user || !archetypeInfo) {
    return (
      <div className="bg-white p-6 border-3 border-black shadow-brutal max-w-xl mx-auto">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-5 w-5 text-vivid-orange" />
          <h3 className="text-lg font-black text-dark-teal">YOUR ARCHETYPE</h3>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎭</div>
          <p className="text-dark-teal font-bold">
            Start resolving conflicts to discover your conflict archetype!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-lime-chartreuse p-6 border-3 border-black shadow-brutal max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-dark-teal" />
          <h3 className="text-lg font-black text-dark-teal">YOUR ARCHETYPE</h3>
        </div>
        {user.archetype_assigned_at && (
          <div className="text-xs text-dark-teal font-bold">
            Assigned: {new Date(user.archetype_assigned_at).toLocaleDateString()}
          </div>
        )}
      </div>
      
      <div className="flex items-start space-x-4 mb-4">
        <div className="text-5xl">{archetypeInfo.emoji}</div>
        <div className="flex-1">
          <h4 className="text-xl font-black text-dark-teal mb-1">{archetypeInfo.title}</h4>
          <p className="text-dark-teal font-bold leading-relaxed">{archetypeInfo.description}</p>
        </div>
      </div>
      
      <button
        onClick={() => navigate('/profile')}
        className="w-full bg-dark-teal hover:bg-teal-800 text-white px-4 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2"
      >
        <span>VIEW ALL ARCHETYPES</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default ArchetypeWidget;