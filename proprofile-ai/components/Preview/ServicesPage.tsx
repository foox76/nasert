import React from 'react';
import { A4Page } from './A4Page';
import { AppState } from '../../types';
import { CheckCircle2, Cog } from 'lucide-react';

interface Props {
  data: AppState;
}

export const ServicesPage: React.FC<Props> = ({ data }) => {
  const { generated, companyInfo } = data;
  const services = generated.refinedServices && generated.refinedServices.length > 0 
    ? generated.refinedServices 
    : Array(6).fill({ title: "Service Placeholder", description: "Generate the profile to view your specialized services." });

  return (
    <A4Page className="p-16 flex flex-col bg-white">
      
       {/* Header */}
      <div className="mb-12 border-b-2 border-gray-100 pb-6">
        <h2 className="text-4xl font-serif font-bold text-primary mb-2">Our Expertise</h2>
        <p className="text-accent font-medium">Comprehensive Solutions & Capabilities</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-10">
        {services.map((service, index) => (
          <div key={index} className="flex gap-4">
             <div className="mt-1">
               <CheckCircle2 className="w-6 h-6 text-gold" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-primary mb-2">{service.title}</h3>
               <p className="text-sm text-gray-500 leading-relaxed text-justify">
                 {service.description}
               </p>
             </div>
          </div>
        ))}
      </div>
      
      {/* Value Prop Box */}
      <div className="mt-auto bg-primary text-white p-8 rounded-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
        <div className="relative z-10 flex gap-4 items-center">
            <Cog className="w-12 h-12 text-accent" />
            <div>
              <h3 className="text-xl font-bold mb-1">Why Choose {companyInfo.name}?</h3>
              <p className="text-sm text-gray-300">
                We combine technical expertise with a commitment to reliability, ensuring every project meets rigorous quality control standards.
              </p>
            </div>
        </div>
      </div>

       <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
         <div className="h-1 w-24 bg-accent"></div>
         <span className="text-xs text-gray-400">Page 03</span>
      </div>

    </A4Page>
  );
};