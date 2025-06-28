import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { redditConflictsService } from '../utils/redditConflicts';
import Toast from './Toast';

interface AdminControlsProps {
  isAdmin: boolean;
}

const AdminControls: React.FC<AdminControlsProps> = ({ isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isAdmin) return null;

  const handleFetchRedditConflict = async () => {
    setLoading(true);
    try {
      const result = await redditConflictsService.fetchNewDailyConflict();
      
      if (result.success) {
        setToast({ 
          message: 'New Reddit conflict fetched successfully!', 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: result.error || 'Failed to fetch new Reddit conflict', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error fetching Reddit conflict:', error);
      setToast({ 
        message: 'An error occurred while fetching the Reddit conflict', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <button
        onClick={handleFetchRedditConflict}
        disabled={loading}
        className="bg-dark-teal text-lime-chartreuse p-1 border-2 border-black hover:bg-teal-800 transition-colors"
        title="Fetch new Reddit conflict"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
      </button>
    </>
  );
};

export default AdminControls;