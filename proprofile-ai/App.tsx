import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { Preview } from './components/Preview';
import { AppState, CompanyInfo, CoreIdentity } from './types';
import { generateProfileContent } from './services/geminiService';

const initialCompanyInfo: CompanyInfo = {
  name: "Apex Solutions",
  tagline: "Building the Future of Infrastructure",
  establishedYear: "2015",
  location: "Business Bay, Dubai, UAE",
  website: "www.apexsolutions.ae",
  email: "contact@apexsolutions.ae",
  phone: "+971 4 123 4567"
};

const initialIdentity: CoreIdentity = {
  vision: "To be the top construction company in Dubai.",
  mission: "We build good houses and keep people safe.",
  aboutRaw: "Started 5 years ago doing small maintenance jobs, now we do big buildings."
};

const initialServices = "AC Maintenance, Plumbing, Electrical Work, Painting, Gypsum Partitions, Floor Tiling";

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<AppState>({
    companyInfo: initialCompanyInfo,
    coreIdentity: initialIdentity,
    rawServices: initialServices,
    generated: {
      refinedVision: "",
      refinedMission: "",
      refinedAbout: "",
      refinedServices: [],
      isGenerated: false
    }
  });

  const handleInputChange = (field: keyof AppState, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing in environment variables.");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedContent = await generateProfileContent(data);
      setData(prev => ({
        ...prev,
        generated: generatedContent
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Left Column - Input Form */}
      <div className="w-[30%] min-w-[350px] h-full no-print relative">
        <InputForm 
          data={data} 
          onChange={handleInputChange} 
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          onPrint={handlePrint}
        />
      </div>

      {/* Right Column - Live Preview */}
      <div className="flex-1 h-full relative">
        <Preview data={data} />
      </div>
    </div>
  );
}

export default App;