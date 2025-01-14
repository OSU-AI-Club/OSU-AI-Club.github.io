import Footer from "./components/footer";
import Navbar from "./components/navbar";

export default function HackAI() {
  return (
    <main class="overflow-x-hidden">
      <Navbar homepage={false} />
      
      <div class="bg-gray-300 shadow-md p-6">
        <div class ="flex flex-col items-center text-center">
          <img src="/logos/HackAI_Logo_Final.png" width="384" height="384" />
        </div>
      </div>

      <div class="bg-white shadow-md p-6">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto text-center">
          <div class="mb-8">
            <div class="mt-4 mb-4">
                <h1 className="text-3xl">Registration opening soon!</h1>
            </div>

            <div class="mt-8 text-left">
              <h1 class="text-3xl font-bold mb-6">About HackAI</h1>

              <p class="mb-4">HackAI is a 2-day hackathon where students can choose from challenges or tackle their own projects with the help of artificial intelligence. Mentors will be provided throughout the day, and judging will occur on the second day to determine the best AI projects of HackAI 2024. Tutorials, datasets, and meals will be provided.</p>
              <p class="mb-4">The event will be held in the <b>Keenan Center for Entrepreneurship</b> and Zoom links will be provided in our HackAI 2025 Discord</p>
              <p class="mb-4">Teams of 1-4 members consisting of all OSU students are eligible for prizes.</p>
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