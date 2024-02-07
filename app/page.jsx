import Navbar from "./components/navbar";

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
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black">Instagram</button>
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black">LinkedIn</button>
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black">Email</button>
          </div>
          <div className = "h-2 w-1/2 flex flex-row justify-evenly items-center">
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black">Club Discord Server</button>
            <button className = "h-12 pl-10 pr-10 text-white border border-white rounded-lg duration-1000 hover:bg-white hover:text-black">Subscribe to our Newsletter</button>
          </div>
        </div>

        <Navbar />
      </div>
    </main>
  );
}
