import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faNewspaper } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
    return (
        <footer class="min-w-screen-xl bg-sky-600 max-h-screen/16 relative">
            <div class="flex flex-row w-screen">

                {/* Club Logo */}
                <a href="/" class="basis-1/4 flex items-center space-x-3 rtl:space-x-reverse justify-center">
                    <Image src="/logos/AI_Logo_Final.png" width="80" height="80" />
                </a>

                {/* Info Row */}
                <div class="basis-1/2 flex flex-col items-center">
                    <h1 class="text-2xl text-white mt-2">Baker Systems 198</h1>
                    <h1 class="text-2xl text-white mt-2">Wednesdays at 7:00pm</h1>
                    <div class="flex flex-row mt-2 mb-2">
                        <button><FontAwesomeIcon icon={faInstagram} className = "text-white size-7 mr-3" /></button>
                        <button><FontAwesomeIcon icon={faLinkedin} className = "text-white size-7 mr-3" /></button>
                        <button><FontAwesomeIcon icon={faDiscord} className = "text-white size-7 mr-3" /></button>
                        <button><FontAwesomeIcon icon={faNewspaper} className = "text-white size-7 mr-3" /></button>
                    </div>
                </div>

                {/* Dead-space since I'm terrible at css */}
                <div class="basis-1/4 flex flex-row items-center">
                    
                </div>
            </div>
        </footer>
    )
}