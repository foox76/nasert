import React from 'react';
import { A4Page } from './A4Page';
import { AppState } from '../../types';
import { ShieldCheck, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface Props {
  data: AppState;
}

export const ContactPage: React.FC<Props> = ({ data }) => {
  const { companyInfo } = data;

  return (
    <A4Page className="flex flex-col">
      {/* Top Half: HSE Section */}
      <div className="h-[45%] bg-slate-50 p-16 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-10 h-10 text-accent" />
          <h2 className="text-3xl font-serif font-bold text-primary">Health, Safety & Quality</h2>
        </div>
        <div className="space-y-4 text-gray-600 text-sm leading-relaxed text-justify">
          <p>
            At <strong>{companyInfo.name}</strong>, Health, Safety, and Environment (HSE) are not just policies but core values embedded in our operational DNA. We are committed to maintaining a zero-accident workplace by strictly adhering to international safety protocols and local regulations.
          </p>
          <p>
            Our Quality Management System ensures that every deliverable meets the highest standards of excellence. We continuously train our workforce to mitigate risks and enhance operational efficiency, ensuring peace of mind for our clients and stakeholders.
          </p>
        </div>
      </div>

      {/* Bottom Half: Contact Info */}
      <div className="h-[55%] bg-primary text-white p-16 relative overflow-hidden">
        
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary opacity-30 rounded-full"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-accent opacity-10 rounded-full"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center">
          <h2 className="text-4xl font-serif font-bold mb-2">Get in Touch</h2>
          <p className="text-slate-400 mb-12">We look forward to partnering with you on your next venture.</p>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <MapPin className="text-accent w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Visit Us</p>
                <p className="text-xl font-medium">{companyInfo.location || "Office Location, City, Country"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Phone className="text-accent w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Call Us</p>
                <p className="text-xl font-medium">{companyInfo.phone || "+971 50 000 0000"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Mail className="text-accent w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs uppercase tracking-wider text-slate-400">Email Us</p>
                <p className="text-xl font-medium">{companyInfo.email || "info@company.com"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Globe className="text-accent w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs uppercase tracking-wider text-slate-400">Website</p>
                <p className="text-xl font-medium">{companyInfo.website || "www.company.com"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </A4Page>
  );
};