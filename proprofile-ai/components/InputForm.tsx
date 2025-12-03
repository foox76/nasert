import React from 'react';
import { AppState } from '../types';
import { Sparkles, Printer, Loader2 } from 'lucide-react';

interface InputFormProps {
  data: AppState;
  onChange: (field: keyof AppState, value: any) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onPrint: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ data, onChange, onGenerate, isGenerating, onPrint }) => {
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('companyInfo', { ...data.companyInfo, [e.target.name]: e.target.value });
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange('coreIdentity', { ...data.coreIdentity, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 overflow-y-auto p-6 flex flex-col gap-6 shadow-lg z-10">
      
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-primary text-white p-1 rounded">Pro</span>Profile AI
        </h1>
        <p className="text-sm text-slate-500 mt-1">Generate ISO-standard corporate profiles.</p>
      </div>

      {/* 1. Company Basics */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Company Details</h2>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
            <input 
              name="name"
              value={data.companyInfo.name}
              onChange={handleCompanyChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
              placeholder="e.g. Apex Construct"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tagline</label>
            <input 
              name="tagline"
              value={data.companyInfo.tagline}
              onChange={handleCompanyChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
              placeholder="Building Excellence"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Year</label>
              <input 
                name="establishedYear"
                value={data.companyInfo.establishedYear}
                onChange={handleCompanyChange}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                placeholder="2010"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
              <input 
                name="location"
                value={data.companyInfo.location}
                onChange={handleCompanyChange}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                placeholder="Dubai, UAE"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Identity */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Core Identity (Raw)</h2>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Our Vision (Draft)</label>
          <textarea 
            name="vision"
            value={data.coreIdentity.vision}
            onChange={handleIdentityChange}
            className="w-full border border-gray-300 rounded p-2 text-sm h-16 focus:ring-2 focus:ring-accent outline-none"
            placeholder="e.g. To be the best builder in the region."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Our Mission (Draft)</label>
          <textarea 
            name="mission"
            value={data.coreIdentity.mission}
            onChange={handleIdentityChange}
            className="w-full border border-gray-300 rounded p-2 text-sm h-16 focus:ring-2 focus:ring-accent outline-none"
            placeholder="e.g. To deliver quality homes on time."
          />
        </div>
         <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">About/History (Draft)</label>
          <textarea 
            name="aboutRaw"
            value={data.coreIdentity.aboutRaw}
            onChange={handleIdentityChange}
            className="w-full border border-gray-300 rounded p-2 text-sm h-20 focus:ring-2 focus:ring-accent outline-none"
            placeholder="We started in 2010 with small jobs..."
          />
        </div>
      </section>

      {/* 3. Services */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Services</h2>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">List your services (AI will expand)</label>
          <textarea 
            value={data.rawServices}
            onChange={(e) => onChange('rawServices', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm h-24 focus:ring-2 focus:ring-accent outline-none"
            placeholder="e.g. HVAC, Plumbing, Electrical Maintenance, Civil Works, Painting"
          />
        </div>
      </section>

      {/* 4. Contact */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Contact Info</h2>
        <div className="grid grid-cols-1 gap-3">
           <input 
              name="email"
              value={data.companyInfo.email}
              onChange={handleCompanyChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
              placeholder="Email Address"
            />
            <input 
              name="phone"
              value={data.companyInfo.phone}
              onChange={handleCompanyChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
              placeholder="Phone Number"
            />
            <input 
              name="website"
              value={data.companyInfo.website}
              onChange={handleCompanyChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
              placeholder="Website URL"
            />
        </div>
      </section>

      {/* Actions */}
      <div className="sticky bottom-0 bg-white pt-4 pb-0 mt-auto flex flex-col gap-3">
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-sky-600 text-white font-bold py-3 px-4 rounded shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          {isGenerating ? 'Drafting Profile...' : 'Generate AI Profile'}
        </button>
        <button 
          onClick={onPrint}
          className="w-full bg-secondary hover:bg-slate-800 text-white font-bold py-3 px-4 rounded shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-5 h-5" />
          Print / Save PDF
        </button>
      </div>

    </div>
  );
};