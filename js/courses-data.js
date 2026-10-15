/**
 * ReSynk — Official Academy Curriculum Data
 * Disciplines: Guitar, Keyboard & Piano, Fine Arts
 * Validity: 3 Months (90 - 120 Days) from date of enrollment
 */

export const COURSES = [
  {
    id: "guitar-mastery",
    title: "Guitar Mastery: Learn from the Experts",
    category: "guitar",
    tagline: "Learn from basic to advanced step by step with certified musicians.",
    price: 249,
    originalPrice: 1499,
    validityDays: 120,
    discipline: "Guitar",
    level: "Basic to Advanced Step by Step",
    badge: "Special Offer • ₹249",
    rating: 4.9,
    reviewsCount: 142,
    totalLectures: 24,
    totalHours: "16 Hours",
    description: "Learn from the experts and certified musicians from basic to advanced step by step. We teach guitar fundamentals, tabs, scales, and chords. Learn to play over 100+ chords and 25 songs for just ₹249! Includes a Certificate of Completion at the end of the course and free access to a live workshop session once course is completed to clarify all your doubts.",
    highlights: [
      "Learn from Basic to Advanced Step by Step with Certified Musicians",
      "Master Guitar Basics, Tabs, Scales & Play 100+ Chords",
      "Learn to Play 25 Songs with Guided Step-by-Step Lessons",
      "Certificate of Completion at the End of the Course",
      "Free Access to Live Workshop Session Once Course Completed to Clarify Doubts",
      "3 Months Access (90 - 120 Days) for Just ₹249"
    ],
    previewVideo: {
      title: "Lecture 01: Anatomy, Tuning, String Physics & The Golden Posture",
      duration: "14:20",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      poster: "assets/guitar_class.jpg",
      notes: "Welcome to ReSynk Guitar Mastery. In this opening masterclass, we dissect guitar anatomy, proper fret hand thumb placement, and how to produce clear, buzz-free tone from day one."
    },
    modules: [
      {
        moduleNumber: "01",
        title: "Foundations & Anatomical Mechanics",
        lessons: [
          {
            id: "g-01",
            number: "1.1",
            title: "Guitar Anatomy, Tuning & The Golden Posture",
            duration: "14:20",
            freePreview: true,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            summary: "Mastering zero-tension posture, string numbering, and electronic tuning fundamentals."
          },
          {
            id: "g-02",
            number: "1.2",
            title: "Finger Independence & The 1-2-3-4 Chromatic Spider",
            duration: "18:45",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            summary: "Strengthening fretting hand pinky control and synchronization with alternate picking."
          },
          {
            id: "g-03",
            number: "1.3",
            title: "The Essential 8 Open Chords (C, G, D, Em, Am, E, A, Dm)",
            duration: "24:10",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            summary: "Anchor finger technique for lightning-fast transitions between basic open chords."
          }
        ]
      },
      {
        moduleNumber: "02",
        title: "Rhythmic Flow & Time Signatures",
        lessons: [
          {
            id: "g-04",
            number: "2.1",
            title: "Mastering the Metronome: Downstrokes, Upstrokes & 4/4 Grooves",
            duration: "21:30",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            summary: "Developing internal pulse, swing feel, and avoiding rushing on the upbeat."
          },
          {
            id: "g-05",
            number: "2.2",
            title: "Syncopation, Percussive Slaps & Palm Muting Dynamics",
            duration: "26:15",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            summary: "Adding percussive body taps and palm muting to produce full acoustic arrangements."
          },
          {
            id: "g-06",
            number: "2.3",
            title: "Barre Chord Breakthrough: F Major & B Minor without Strain",
            duration: "29:40",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            summary: "Leverage physics over brute force: index finger roll and arm weight mechanics."
          }
        ]
      },
      {
        moduleNumber: "03",
        title: "Harmonics, Scales & Fingerstyle Repertoire",
        lessons: [
          {
            id: "g-07",
            number: "3.1",
            title: "Travis Picking & Polyphonic Fingerstyle Principles",
            duration: "32:10",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            summary: "Separating thumb bassline independence from index and middle melody picking."
          },
          {
            id: "g-08",
            number: "3.2",
            title: "The Minor Pentatonic Scale & Expressive Bending",
            duration: "28:50",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            summary: "Box 1 mastery, target chord tones, vibrato technique, and emotional phrasing."
          },
          {
            id: "g-09",
            number: "3.3",
            title: "Song Performance Analysis: Contemporary Fusion Classic",
            duration: "35:00",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
            summary: "Putting all techniques together into an expressive multi-part acoustic performance."
          }
        ]
      }
    ]
  },
  {
    id: "keyboard-mastery",
    title: "Keyboard & Piano Mastery",
    category: "keyboard",
    tagline: "Learn from basic to advanced step by step with certified musicians.",
    price: 249,
    originalPrice: 1499,
    validityDays: 120,
    discipline: "Keyboard & Piano",
    level: "Basic to Advanced Step by Step",
    badge: "Coming Soon",
    comingSoon: true,
    rating: 4.95,
    reviewsCount: 118,
    totalLectures: 28,
    totalHours: "18 Hours",
    description: "Learn piano and keyboard from the experts! Step-by-step guidance from basic to advanced: keyboard geography, scales, chord voicings, two-hand coordination, and playing your favorite melodies with ease. Includes Certificate of Completion at the end of the course and free access to live workshop session to clarify doubts. *Coming Soon*.",
    highlights: [
      "Learn from Basic to Advanced Step by Step with Certified Musicians",
      "Keyboard Geography, Scales, Inversions & Two-Hand Coordination",
      "Learn to Play Songs & Contemporary Accompaniments with Ease",
      "Certificate of Completion at the End of the Course",
      "Free Access to Live Workshop Session to Clarify Doubts",
      "*Coming Soon* — Enrollments Opening Soon"
    ],
    previewVideo: {
      title: "Lecture 01: Piano Geography, Octaves & Hand Independence",
      duration: "16:40",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      poster: "assets/keyboard_class.jpg",
      notes: "Demystifying the 88 keys through the twin-black and triple-black pattern. Natural curvature of the fingers and relaxed wrist posture."
    },
    modules: [
      {
        moduleNumber: "01",
        title: "Keyboard Anatomy & Spatial Familiarity",
        lessons: [
          {
            id: "k-01",
            number: "1.1",
            title: "Keyboard Geography, Middle C & Natural Hand Curve",
            duration: "16:40",
            freePreview: true,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            summary: "Identifying octave registers, proper bench height, and relaxed forearm alignment."
          },
          {
            id: "k-02",
            number: "1.2",
            title: "The Grand Staff: Treble & Bass Clefs Decoded",
            duration: "22:15",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            summary: "Mnemonic devices for line and space notes, rhythmic notation, and counting."
          },
          {
            id: "k-03",
            number: "1.3",
            title: "C Major Scale & The Golden Fingering Formula (1-2-3-1-2-3-4-5)",
            duration: "19:50",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            summary: "Smooth thumb-under technique for uninterrupted ascending and descending scales."
          }
        ]
      },
      {
        moduleNumber: "02",
        title: "Comprehensive Music Theorem & Harmony",
        lessons: [
          {
            id: "k-04",
            number: "2.1",
            title: "Major & Minor Triads Construction: Intervals & Formula",
            duration: "27:00",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            summary: "Root, major third, minor third, and perfect fifth intervals explained mathematically."
          },
          {
            id: "k-05",
            number: "2.2",
            title: "Inversions: Voice Leading & Smooth Harmonic Motion",
            duration: "25:40",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            summary: "Root position, 1st inversion, and 2nd inversion without hopping across octaves."
          },
          {
            id: "k-06",
            number: "2.3",
            title: "The Diatonic Chords of C, G, and F Major: The I-V-vi-IV Engine",
            duration: "31:10",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            summary: "Unlocking 90% of contemporary popular music using functional harmonic progressions."
          }
        ]
      },
      {
        moduleNumber: "03",
        title: "Accompaniment Patterns & Expressive Performance",
        lessons: [
          {
            id: "k-07",
            number: "3.1",
            title: "Left-Hand Broken Chords & Arpeggio Accompaniments",
            duration: "28:30",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            summary: "Creating flowing ballad accompaniments and dynamic sustained pedal control."
          },
          {
            id: "k-08",
            number: "3.2",
            title: "Playing by Ear: Relative Pitch & Transposition Secrets",
            duration: "34:20",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            summary: "How to listen to any song and deduce its tonal center and chord progression."
          }
        ]
      }
    ]
  },
  {
    id: "fine-arts-mastery",
    title: "Fine Arts & Creative Expression Studio",
    category: "arts",
    tagline: "Inspiring step-by-step guidance in sketching, realistic painting & concept art for all ages.",
    price: 249,
    originalPrice: 1499,
    validityDays: 120,
    discipline: "Fine Arts",
    level: "All Ages (Kids to Adults)",
    badge: "Coming Soon",
    comingSoon: true,
    rating: 4.92,
    reviewsCount: 89,
    totalLectures: 20,
    totalHours: "14 Hours",
    description: "Explore your creative potential through inspiring step-by-step guidance! From foundational pencil sketching and shading to realistic portraiture, concept art, and vibrant canvas painting. Open and encouraging for all ages — from kids to adults. Includes Certificate of Completion at the end of the course and free access to live workshop session to clarify doubts. *Coming Soon*.",
    highlights: [
      "Step-by-Step Guidance from Basic Sketching to Realistic Painting",
      "Realistic Portraiture, Concept Art & Canvas Painting",
      "Encouraging Training Designed for All Ages — Kids to Adults",
      "Certificate of Completion at the End of the Course",
      "Free Access to Live Workshop Session to Clarify Doubts",
      "*Coming Soon* — Enrollments Opening Soon"
    ],
    previewVideo: {
      title: "Lecture 01: The Grammar of Line, Grip & Pencil Grades (2H to 8B)",
      duration: "15:10",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      poster: "assets/fine_arts_class.jpg",
      notes: "Understanding graphite hardness, cross-hatching, stippling, and smooth continuous tonal gradients."
    },
    modules: [
      {
        moduleNumber: "01",
        title: "Draftsmanship & Tonal Values",
        lessons: [
          {
            id: "fa-01",
            number: "1.1",
            title: "The Grammar of Line, Grip & Pencil Grades (2H to 8B)",
            duration: "15:10",
            freePreview: true,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            summary: "Overhand grip vs tripod grip, pressure control, and creating a 10-step value scale."
          },
          {
            id: "fa-02",
            number: "1.2",
            title: "Light Physics: Core Shadows, Cast Shadows & Reflected Light",
            duration: "23:45",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            summary: "Rendering 3D volume on 2D paper using spheres, cylinders, and cubes."
          },
          {
            id: "fa-03",
            number: "1.3",
            title: "1-Point & 2-Point Linear Perspective in Architecture",
            duration: "26:30",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            summary: "Horizon lines, vanishing points, and creating realistic streetscapes with depth."
          }
        ]
      },
      {
        moduleNumber: "02",
        title: "Form, Anatomy & Portraiture",
        lessons: [
          {
            id: "fa-04",
            number: "2.1",
            title: "The Loomis Method: Head Proportions & Facial Features",
            duration: "30:15",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            summary: "Standard facial proportions: eye width spacing, nose alignment, and lip contours."
          },
          {
            id: "fa-05",
            number: "2.2",
            title: "Charcoal Mastery: Expressive Smudging & Kneaded Eraser Highlights",
            duration: "28:00",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            summary: "Drawing with light: using kneaded erasers to sculpt drama and contrast into charcoal."
          }
        ]
      },
      {
        moduleNumber: "03",
        title: "Color Theory & Acrylic Canvas Painting",
        lessons: [
          {
            id: "fa-06",
            number: "3.1",
            title: "Color Temperature, Complementary Harmonies & The Color Wheel",
            duration: "25:50",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            summary: "Warm vs cool primaries, desaturating colors with complements instead of black."
          },
          {
            id: "fa-07",
            number: "3.2",
            title: "Step-by-Step Acrylic Landscape on Stretched Canvas",
            duration: "38:40",
            freePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            summary: "Layering background to foreground, impasto palette knife details, and final glaze."
          }
        ]
      }
    ]
  }
];

export const FOUNDER_PORTFOLIO = {
  name: "Master Rey",
  academy: "ReSynk",
  foundedYear: "2014",
  role: "Founder — Professional Guitarist, Music Composer & Vocalist",
  motto: "Learn • Create • Master",
  overview: "Professional guitarist, music composer, and vocalist with over 10 years of experience. Founder of D Paul's Academy and Director & Founder of ReSynk.in. Master Rey has trained over 5,000 students, including aspiring artists from abroad. Certified music teacher who has composed official anthems for several leading educational institutions.",
  coFounder: {
    name: "Sneha Sharma",
    role: "Co-Founder & Concept Artist",
    overview: "Excellent artist and concept artist specializing in realistic painting and exquisite portraits. Passionate educator offering encouraging training for all ages, from kids to adults."
  },
  founderHighlights: [
    { title: "Professional Guitarist, Music Composer & Vocalist", detail: "Over a decade of guitar performance, composition, and vocal mentoring." },
    { title: "Director & Founder for ReSynk.in", detail: "Visionary leadership providing accessible, master-level arts education." },
    { title: "Trained Over 5,000 Students Worldwide", detail: "Mentored over 5,000 students across India and abroad." },
    { title: "Certified Music Teacher & Institutional Anthem Composer", detail: "Composed official anthems for prestigious educational institutions." }
  ],
  coFounderHighlights: [
    { title: "Concept Artist & Realistic Painter", detail: "Mastering high-fidelity portraiture, realistic shading, and vibrant canvas painting." },
    { title: "Training for All Ages (Kids to Adults)", detail: "Warm, encouraging pedagogy structured for young children through adult learners." },
    { title: "Academy Operations & Strategy", detail: "Directing student admissions, curriculum standards, and school partnerships." }
  ],
  awards: [
    { title: "Seva Bhushan Puraskar Award", level: "State Level Honor", description: "Recognizing sustained excellence, social impact, and artistic dedication across Karnataka." },
    { title: "Best Empowering Choreographer", level: "Awarded by Swing", description: "Honoring cutting-edge choreography and rhythm mentoring that empowers performers." },
    { title: "Coherence Appreciation Award", level: "Artistic Distinction", description: "Conferred for artistic integrity, multidisciplinary harmony, and conservatory curriculum development." }
  ],
  specialAppearances: [
    { institution: "St Francis PU College", type: "Special Appearance (×2)", note: "Annual cultural fest & youth talent gala presentations." },
    { institution: "Santa Fest by Swing", type: "Special Appearance", note: "Statewide youth rhythm, stagecraft, and group choreography showcase." },
    { institution: "St Anne’s College PU College", type: "Special Appearance (×2)", note: "Youth talent discovery & annual day ceremonies." },
    { institution: "St Anne’s Women’s Degree College", type: "Special Appearance", note: "Inter-collegiate creative arts and annual exhibitions." },
    { institution: "St Francis Xavier Degree College", type: "Special Appearance", note: "Music ensembles & inter-collegiate performing festivals." },
    { institution: "United College", type: "Special Appearance", note: "University-level performing arts and cultural festival." }
  ],
  majorEvents: [
    { title: "Survana Karnataka Varnangal Event", years: "2016, 2017, 2018, 2023, 2024", highlight: "Statewide grand cultural celebrations with special appearance and artistic direction." },
    { title: "Swing Event", years: "2018, 2019", highlight: "Special appearance, choreography mentorship, and music coordination." },
    { title: "Global Thinkers Summit Events", years: "2017 & 2018", highlight: "Special appearance and creative presentation for international delegations." },
    { title: "Corporate Cultural Events — Mphasis", years: "2015", highlight: "Special appearance, team rhythm workshops, and stage performances." },
    { title: "Corporate Cultural Events — IBM", years: "2014", highlight: "Special appearance and large-scale cultural entertainment coordination." },
    { title: "Community Food Fests & Wedding Galas", years: "Ongoing", highlight: "Special appearances, bespoke acoustic performances, and choreography showcases." }
  ],
  communities: [
    "Suvarna Karnataka Kerala Samajan",
    "Orkid Woods Dance Classes",
    "Krishna Northwoods",
    "Purva Palm Beach Dance",
    "Vajram Essenza",
    "Mantri Web City",
    "Brigade Towers",
    "Nikko Apartments"
  ],
  schoolsCollaborations: [
    {
      group: "Group 1",
      schools: ["Clarence High School", "Kinderdale International", "Hello Kids", "Star Kids"]
    },
    {
      group: "Group 2",
      schools: ["Balayesu Vidhyalaya", "Riverstone International", "Crystal English School"]
    },
    {
      group: "Group 3",
      schools: ["Shreyaan Public School", "St Norbert High School", "St Theresa Baca"]
    },
    {
      group: "Group 4",
      schools: ["St Mariyum Mariam Primary School", "St Patrick’s High School", "United International School", "St Norberts ICSE School", "Hegemony Global School"]
    }
  ],
  collegesAnnualDays: [
    "St Francis PU College",
    "St Anne’s College PU College",
    "St Anne’s Women’s Degree College",
    "St Francis Xavier Degree College"
  ],
  contact: {
    email: "info@resynk.in",
    address: "ReSynk, Kothanur, Bangalore 560077",
    addressLandmark: "Near Hennur Main Road — accessible from Thanisandra, Byrathi & Horamavu"
  }
};
