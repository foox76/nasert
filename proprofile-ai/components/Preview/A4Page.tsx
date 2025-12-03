import React, { ReactNode } from 'react';

interface A4PageProps {
  children: ReactNode;
  className?: string;
}

export const A4Page: React.FC<A4PageProps> = ({ children, className = '' }) => {
  return (
    <div className={`a4-page shadow-2xl mb-8 print-page-break print:shadow-none print:mb-0 ${className}`}>
      {children}
    </div>
  );
};