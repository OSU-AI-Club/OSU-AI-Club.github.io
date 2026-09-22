import { CLUB_EMAIL, HACKAI_DATE_FULL, HACKAI_NAME, MEETING_TIME, MEETING_DAY, MEETING_LOCATION } from './general';

export const FAQS = [
  {
    q: "Who is eligible to join the club?",
    a: "Any student enrolled at The Ohio State University (undergraduate, graduate, or PhD) is welcome to join immediately! There are no GPA hurdles or application filters for base membership."
  },
  {
    q: "What if I have zero coding or AI database experience?",
    a: "No problem at all! Most of our members started right where you are. We offer structured, beginner-friendly workshops (starting with Python basics and Intro to PyTorch) designed specifically to get you up to speed."
  },
  {
    q: "Does it cost anything to be a member?",
    a: "No, general membership is entirely free of charge. Thanks to our corporate sponsors and engineering department funding, all workshops, resources, events, and pizzas are fully covered!"
  },
  {
    q: "How do I join a semester project team?",
    a: "Project teams form throughout the semester. Attend the Projects Kickoff, hear project pitches from team leads, or pitch your own idea, and sign up directly."
  },
  {
    q: "How can I participate in HackAI?",
    a: `HackAI is open to all university students. Registration typically opens about 2 months before the event (${HACKAI_DATE_FULL}). Check out our HackAI page for up-to-the-minute updates and prize structures.`
  }
];

export const HACKAI_FAQS = [
  {
    q: "Who is eligible to participate in HackAI?",
    a: "All currently enrolled undergraduate, graduate, and PhD university students (including students from Ohio State and other institutions) are welcome. No prior experience or club admission is required. Any degree branch or background can join!"
  },
    {
    q: "Does registrations or attendance cost anything?",
    a: "Absolutely not! HackAI is 100% free for all admitted hackers. We provide complete catered meals, beverages, snacks, official event shirts, specialized computing credits, and premium swag throughout the weekend."
  },
  {
    q: "What is the team size limit?",
    a: "You can collaborate in teams of 1 to 4 individuals. We will host a dedicated team-formation channel on Discord and a live matchmaking session right after the opening ceremony if you need to find partners."
  },
    {
    q: "What if I don't have a team?",
    a: `At the end of our weekly ${MEETING_TIME} ${MEETING_DAY} meetings at ${MEETING_LOCATION} we will have a team formation session for anyone looking for teammates. You can also ask around in the Artificial Intelligence Club Discord or ${HACKAI_NAME} Discord.`
  },
  {
    q: "Can I participate virtually?",
    a: "Yes! We are using Discord as our online platform. You will be able to work with your team, connect with mentors and get judged through Discord. All events will be hybrid and Zoom links will be posted in the Discord."
  },
  {
    q: "What should I bring to the hackathon?",
    a: "Bring your laptop, power adapter/chargers, any hardware accessories/devices you want to develop on, and your BuckID/student identification card. Sleeping bags, eye masks, and earplugs are recommended if you plan to nap at the venue. Meals will be provided."
  },
  {
    q: "Are beginner-friendly tutorials or workshops provided?",
    a: "Yes! We run specialized intro workshops, cloud deployment tutorials, and API starter guides early in the weekend. Plus, we have professional industry mentors and graduate teaching assistants on-site to assist with debugging."
  },
  {
    q: "How is submission judging structured?",
    a: "Projects are exhibited in a high-energy, interactive science-fair demo layout. Teams pitch their software live to judges from experts, research sponsors, and faculty members who grade based on creativity, technical capability, and product design."
  }
];

export const INCUBATOR_FAQS = [
  {
    q: "What is the AIC Project Incubator?",
    a: "It is how the club puts real backing behind student-led AI projects. Sponsored teams get access to AIC's network of contacts, university systems and compute resources, and marketing support — both to professors across departments and to fellow students looking to join a team."
  },
  {
    q: "Who can apply for sponsorship?",
    a: "Any Ohio State student, in any major and at any level. Apply on your own or as an existing team — there is no minimum team size."
  },
  {
    q: "What kinds of projects are eligible?",
    a: "Projects of all sizes. Small ones built for fun, educational projects meant to teach other students, sponsorship work already running for another organization, potential startups, and established businesses are all in scope."
  },
  {
    q: "Do I need a working prototype to apply?",
    a: "No. Whether you are starting from an idea or already have something running, sponsorship is built to help at either point — earlier teams tend to lean on introductions and teammate recruiting, further-along teams on systems and compute."
  },
  {
    q: "What does sponsorship actually get me?",
    a: "Three things: introductions through AIC's network of contacts, access to university systems and compute resources, and marketing — to professors across departments who can advise or open doors, and to students looking for a team to join."
  },
  {
    q: "How do I apply?",
    a: `Fill out the sponsorship form linked above. If you are unsure whether your project is a fit, email us at ${CLUB_EMAIL} before applying and we will talk it through.`
  }
];
