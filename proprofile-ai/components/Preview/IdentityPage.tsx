import React from 'react';
import { A4Page } from './A4Page';
import { AppState } from '../../types';
import { Target, Eye, Building2 } from 'lucide-react';

interface Props {
  data: AppState;
}

export const IdentityPage: React.FC<Props> = ({ data }) => {
  const { generated, companyInfo } = data;

  return (
    <A4Page className="p-16 flex flex-col relative">
      
      {/* Header */}
      <div className="mb-12 border-b-2 border-gray-100 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-primary mb-2">Who We Are</h2>
          <p className="text-accent font-medium">Our Foundation & Philosophy</p>
        </div>
        <div className="text-sm text-gray-400">{companyInfo.name}</div>
      </div>

      <div className="flex-grow flex flex-col gap-10">
        
        {/* About Us Section */}
        <section className="bg-slate-50 p-8 rounded-lg border-l-4 border-primary">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-gold w-6 h-6" />
            <h3 className="text-xl font-bold text-primary uppercase tracking-wide">About {companyInfo.name}</h3>
          </div>
          <div className="text-gray-600 leading-relaxed text-justify space-y-4 text-sm">
             {generated.refinedAbout ? (
               generated.refinedAbout.split('\n').map((paragraph, i) => (
                 <p key={i}>{paragraph}</p>
               ))
             ) : (
               <p className="italic text-gray-400">Generate the profile to see the professional corporate introduction here.</p>
             )}
          </div>
        </section>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 gap-8 mt-4">
          
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {generated.refinedVision || "To become the regional leader in our sector by delivering unparalleled quality and sustainable value to our stakeholders."}
              </p>
            </div>
          </div>

          <div className="flex gap-6">
             <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {generated.refinedMission || "To execute projects with precision, fostering innovation and safety while adhering to the highest international standards."}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Footer */}
      <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center">
         <div className="h-1 w-24 bg-accent"></div>
         <span className="text-xs text-gray-400">Page 02</span>
      </div>
    </A4Page>
  );
};