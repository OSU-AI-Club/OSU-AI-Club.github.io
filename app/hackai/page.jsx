import Footer from "../components/footer";
import Navbar from "../components/navbar";
import Image from 'next/image'

export default function HackAI() {
  return (
    <main class="overflow-x-hidden">
      <Navbar homepage={false} />
      
      <div class="bg-gray-300 shadow-md p-6">
        <div class ="flex flex-col items-center text-center">
          <Image src="/logos/HackAI_Logo_Final.png" width="384" height="384" />
        </div>
      </div>

      <div class="bg-white shadow-md p-6">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto text-center">
          <div class="mb-8">
            <div class="mt-4 mb-4">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLScWudx7OlQTawcyMCPEMk1GcbM1sdbTmgdYH3yCNXMNSMmuVQ/viewform?pli=1">
                <button class="mr-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-10 px-10 rounded">
                  <p class="text-xl">Registration Form</p>
                </button>
              </a>

              <a href="INSERTLINKHERE">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-10 px-10 rounded">
                  <p class="text-xl">HackAI 2024 Discord</p>
                </button>
              </a>
            </div>

            <div class="mt-8 text-left">
              <h1 class="text-3xl font-bold mb-6">About HackAI</h1>

              <p class="mb-4">HackAI is a 2-day hackathon where students can choose from challenges or tackle their own projects with the help of artificial intelligence. Mentors will be provided throughout the day, and judging will occur on the second day to determine the best AI projects of HackAI 2024. Tutorials, datasets, and meals will be provided.</p>
              <p class="mb-4">All in-person events will be in <b>Pomerene Hall 280</b> and Zoom links will be provided in our HackAI 2024 Discord</p>
              <p class="mb-4">Teams of 1-4 members consisting of all OSU students are eligible for prizes.</p>
            </div>

            <div class="mt-8 text-left">
              <h1 class="text-xl font-bold mb-6">Day 1 February 17th 8am - 10pm</h1>

              <p class="mb-4">We will have an opening kickoff at 9am before releasing students to work on their projects. Mentors will be around to assist students with any project questions. Food will be provided to participants and mentors throughout the day.</p>
            </div>

            <div class="mt-8 text-left">
              <h1 class="text-xl font-bold mb-6">Day 2 February 18th 8am - 4pm</h1>

              <p class="mb-4">Students are welcome to work throughout the night and submit project video submissions by 11am. Judges will watch video submissions and meet with teams on their projects. Once the judging is over, scores will be tallied and the awards ceremony will commence at 3pm.</p>
            </div>

            <div class="mt-8 text-left flex flex-col">
              <h1 class="text-4xl font-bold mb-6">HackAI Sponsors</h1>
              <div class="flex flex-row">
                <Image src="/logos/AIFutures_Logo_Final.png" width="256" height="256" class="mr-16" />
                <Image src="/logos/99PLabs_Logo_Final.png" width="256" height="256" />
              </div>
            </div>

            <div class="mt-8 text-left">
              <p class="text-sky-400"><a href="https://www.osuaiclub.com/recap.html">See Past HackAIs and Winners</a></p>
            </div>

          </div>       
        </div>
      </div>

      <div class="bg-gray-300 shadow-md p-1">
        {/* FAQ */}
        <div class="mt-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto text-left">
          <div>
            <h1 class="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>I've never participated in an Artificial Intelligence themed hackathon, can I still participate?</strong><br /> Yes! Everyone is welcome to participate! We will have mentors to answer any questions and you also have your awesome team to help you out.</p>
            </div>
            
            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>Can I participate virtually?</strong><br /> Yes! We are using Discord as our online platform. You will be able to work with your team, connect with mentors and get judged through Discord. All events will be hybrid and Zoom links will be posted in the Discord.</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>Where is your virtual platform?</strong><br /> The Discord will be used specifically for HackAI 2024 go.osu.edu/HackAIDiscord.</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>What if I don't have a team?</strong><br /> At the end of our weekly meetings on Wednesdays from 7-8pm, we will have a team formation session for anyone looking for teammates. You can also ask around in the Artificial Intelligence Club Discord or HackAI 2024 Discord.</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>Will there be swag?</strong><br /> Yes! There will be a cool t-shirt, stickers and more!</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>Who hosts HackAI?</strong><br /> HackAI is hosted by a group of students from the Artificial Intelligence Club at Ohio State.</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>Do I need to be a part of the AI Club to participate in HackAI?</strong><br /> No! All students are welcome to participate!</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>I attend another university, can I still participate</strong><br /> Yes! All students attending a US university are allowed to participate.</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6 mb-8">
              <p class="mb-4"><strong>Any Other Questions?</strong><br /> Contact osuaiclub@gmail.com or ask in the Discord.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
