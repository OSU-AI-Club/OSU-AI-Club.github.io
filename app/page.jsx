import Navbar from "./components/navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Image } from 'next/image';

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      <div className = "relative h-screen overflow-y-hidden">
        <video autoPlay muted loop className = "w-screen absolute -top-24 left-0 right-0 z-1 ">
          <source src="/videos/splash-screen-video.mp4" type="video/mp4" />
        </video>
        <div className = "h-screen w-screen absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-zinc-900 to-blue-700 opacity-50 z-2"></div>
        <div className = "h-screen w-screen relative z-3 flex flex-col justify-center items-center">
          <h1 className = "text-6xl text-white font-mono font-bold">Artificial Intelligence Club @ OSU</h1>
          <p className = "text-2xl text-white mt-8 font-mono font-thin">Baker Systems 198</p>
          <p className = "text-2xl text-white mt-6 font-mono font-thin">Wednesdays at 7:00PM</p>
          <p className = "text-2xl text-white mt-6 font-mono font-thin">2070 Neil Ave, Columbus, OH 43210</p>
          <div className = "h-48 w-1/2 flex flex-row justify-evenly items-center">
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black flex flex-row justify-center items-center"><FontAwesomeIcon icon={faInstagram} className = "text-white size-7 mr-3" />Instagram</button>
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black flex flex-row justify-center items-center"><FontAwesomeIcon icon={faLinkedin} className = "text-white size-7 mr-3" />LinkedIn</button>
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black flex flex-row justify-center items-center"><FontAwesomeIcon icon={faEnvelope} className = "text-white size-7 mr-3" />Email</button>
          </div>
          <div className = "h-2 w-1/2 flex flex-row justify-evenly items-center">
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black flex flex-row justify-center items-center"><FontAwesomeIcon icon={faDiscord} className = "text-white size-7 mr-3" />Club Discord Server</button>
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black flex flex-row justify-center items-center"><FontAwesomeIcon icon={faNewspaper} className = "text-white size-7 mr-3" />Subscribe to our Newsletter</button>
          </div>
        </div>
        <Navbar homepage={true} /> 

      </div>
      <div className="bg-gray-100 py-12">
    <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Who We Are</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center md:text-left">
                    <p className="text-lg mb-4">We are a student organization run by passionate students and researchers.</p>
                    <p className="text-lg mb-4">Our goal is to educate, inspire, and connect students on the topic of Artificial Intelligence.</p>
                    <p className="text-lg mb-4">We're proud to have hosted Intel, Microsoft, and many others.</p>
                </div>
                <div>
                    <img className="mx-auto md:float-right" src="/images/whoWeAre.JPG" alt="Club Members" />
                </div>
            </div>
        </div>
    </div>
    <div className="bg-gray-200 py-12">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8">What We Do</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img className="mx-auto md:float-left h-32 md:w-auto mb-4 mr-4" src="/images/HackAI.png" alt="Hack AI Logo" />
                    <img className="mx-auto md:float-left h-32 md:w-auto mb-4 mr-4" src="/images/ResearchLab.jpeg" alt="Hack AI Logo" />
                </div>
                <div className="text-center md:text-left">
                    <p className="text-lg mb-4">We bring in speakers from the industry and academia.</p>
                    <p className="text-lg mb-4">We host our own workshops for students to learn about AI.</p>
                    <p className="text-lg mb-4">Once a year, we put on an Artificial Intelligence hackathon called HackAI.</p>
                </div>
            </div>
        </div>
    </div>
    <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8 text-center">Get Involved</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="bg-white p-4 rounded-lg mb-4 h-72">
                        <h3 className="text-lg font-semibold mb-2">Want to join?</h3>
                        <p className="text-lg">Everyone of all skill levels is welcome! If you are interested in joining make sure to subscribe to our newsletter, join the Discord, fill out the registration form, and come to our weekly meetings every Wednesdays 7:00-8:00 pm in Baker Systems 198!</p>
                    </div>
                </div>
                <div>
                    <div className="bg-white p-4 rounded-lg mb-4 h-72">
                        <h3 className="text-lg font-semibold mb-2">Want to Present?</h3>
                        <p className="text-lg">We welcome presentations of any topic in AI. When you're ready, email us, and we'll discuss what events are possible.</p>
                    </div>
                </div>
                <div>
                    <div className="bg-white p-4 rounded-lg mb-4 h-72">
                        <h3 className="text-lg font-semibold mb-2">Want to Sponsor?</h3>
                        <p className="text-lg">Sponsors get many benefits, including access to resumes. Check out our sponsorship packet <a href="resources/2022-2023 AI Club Sponsorship Packet.pdf" className="text-blue-600">here</a>. Please email us for further information.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="bg-gray-200 py-12">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8 text-center">Officers</h1>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="text-center">
                    <h3>Marty Kahn</h3>
                    <p>President</p>
                </div>
                <div className="text-center">
                    <h3>Wei-Lun (Harry) Chao</h3>
                    <p>Advisor</p>
                </div>
                <div className="text-center">
                    <h3>Defne Ceyhan</h3>
                    <p>Vice President</p>
                </div>
                <div className="text-center">
                    <h3>Tomasz Frelek</h3>
                    <p>Treasurer</p>
                </div>
                <div className="text-center">
                    <h3>Pranav Chati</h3>
                    <p>Chief Technology Officer</p>
                </div>
                <div className="text-center">
                    <h3>Rahul Nalam</h3>
                    <p>Outreach Coordinator</p>
                </div>
                <div className="text-center">
                    <h3>Sammy Aidja</h3>
                    <p>Outreach Coordinator</p>
                </div>
                <div className="text-center">
                    <h3>Nate Crowder</h3>
                    <p>Events Coordinator</p>
                </div>
                <div className="text-center">
                    <h3>Emmanuel Key</h3>
                    <p>Social Media Coordinator</p>
                </div>
                <div className="text-center">
                    <h3>Olivia Yang</h3>
                    <p>Social Media Coordinator</p>
                </div>
            </div>
        </div>
    </div>
    <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8 text-center">Sponsors</h1>
            <div className="flex justify-center">
                <a href="https://www.honda.osu.edu/affiliations/99p-labs" target="_blank" rel="noopener noreferrer" className="mr-4">
                    <img src="/images/99PLabs_Logo.png" alt="Honda 99PLabs Logo" className="w-48 h-auto" />
                </a>
                <a href="https://aifutures.us" target="_blank" rel="noopener noreferrer">
                    <img src="/images/AI_Futures_Logo.png" alt="AI Futures Logo" className="w-48 h-auto" />
                </a>
            </div>
        </div>
    </div>
    </main>
  );
}
