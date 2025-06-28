import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AdminBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };

  return (
    <div className={`inline-flex items-center space-x-1 bg-dark-teal text-lime-chartreuse font-black border-2 border-black ${sizeClasses[size]} ${className}`}>
      <ShieldCheck className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />
      <span>ADMIN</span>
    </div>
  );
};

export default AdminBadge;