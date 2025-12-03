import React from 'react';
import { A4Page } from './A4Page';
import { AppState } from '../../types';

interface Props {
  data: AppState;
}

export const CoverPage: React.FC<Props> = ({ data }) => {
  const { companyInfo } = data;
  
  return (
    <A4Page className="relative bg-primary text-white flex flex-col justify-between">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary opacity-30 rounded-bl-full transform translate-x-20 -translate-y-20" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent opacity-20 rounded-bl-full transform translate-x-10 -translate-y-10" />
      
      <div className="absolute bottom-0 left-0 w-full h-[35%] bg-white transform -skew-y-6 origin-bottom-right" />
      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-slate-100 transform -skew-y-6 origin-bottom-right" />

      {/* Header Content */}
      <div className="relative z-10 p-16 pt-32">
        <div className="text-accent font-bold tracking-[0.2em] uppercase mb-4 text-sm">Corporate Profile</div>
        <h1 className="text-6xl font-serif font-bold leading-tight mb-6">
          {companyInfo.name || "Company Name"}
        </h1>
        <div className="h-1 w-32 bg-gold mb-8"></div>
        <p className="text-2xl font-light text-slate-300 max-w-md leading-relaxed">
          {companyInfo.tagline || "Innovating the future, today."}
        </p>
      </div>

      {/* Footer / Bottom Content */}
      <div className="relative z-10 p-16 flex justify-between items-end text-slate-800">
        <div>
           <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Established</div>
           <div className="text-4xl font-bold">{companyInfo.establishedYear || "20XX"}</div>
        </div>
        <div className="text-right">
           <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Headquarters</div>
           <div className="text-xl font-semibold">{companyInfo.location || "City, Country"}</div>
        </div>
      </div>
    </A4Page>
  );
};