import React from 'react';
import { AppState } from '../../types';
import { CoverPage } from './CoverPage';
import { IdentityPage } from './IdentityPage';
import { ServicesPage } from './ServicesPage';
import { ContactPage } from './ContactPage';

interface PreviewProps {
  data: AppState;
}

export const Preview: React.FC<PreviewProps> = ({ data }) => {
  return (
    <div className="w-full h-full bg-slate-200 overflow-y-auto p-8 print:p-0 print:overflow-visible print:h-auto print:bg-white print:block print-reset">
      <div className="max-w-[210mm] mx-auto print:max-w-none print:w-full print:mx-0">
        <CoverPage data={data} />
        <IdentityPage data={data} />
        <ServicesPage data={data} />
        <ContactPage data={data} />
      </div>
    </div>
  );
};