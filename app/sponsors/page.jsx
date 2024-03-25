import Navbar from "@/app/components/navbar";

import React from 'react';

const sponsorsData = [
  {
    id: 1, 
    name: 'AI Futures', 
    logoUrl: '/images/AI_Futures_Logo.png', 
    website: 'https://aifutures.us/',
    paragraph: 'AI Futures is funded by the Department of Defense to develop a workforce that can develop and manage emerging technologies. This company supports students who are interested in AI and Machine Learning!',
  }, 
  {
    id: 2, 
    name: '99P Labs', 
    logoUrl: '/images/99PLabs_Logo.png', 
    website: 'https://honda.osu.edu/affiliations/99p-labs',
    paragraph: 'The purpose of 99P Labs is to provide a sustainable society where people can enjoy mobility. It is an influential digitial environment supported by Honda and The Ohio State University.', 
  },
]
export default function SponsorsPage() {
  return (
    <main className="">
      <Navbar homepage={false} />
      
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-4 text-black">Our Sponsors</h1>
          <p className="text-xl font-semibold my-10">We would like to extend our heartfelt thanks to AI Futures and 99P Labs for 
          supporting the OSU AI Club. Without their support, we wouldn't be possible.</p>

          <div className="flex flex-col my-35 flex items-center">
          {sponsorsData.map((sponsor) => (
            <div key={sponsor.id} className="margin my-10 flex items-center"> 
              <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                <img src={sponsor.logoUrl} alt={sponsor.name} className=" h-auto size-80 mr-10" />
              </a>
              
              <p className='text-lg ml-10'>{sponsor.paragraph}</p>
            </div>

     
          
          ))}
          </div>
        </div>
      </div>
    </main>
  );
};