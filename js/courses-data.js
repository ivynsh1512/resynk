/**
 * resynk — Official Academy Curriculum Data
 * Disciplines: Guitar, Keyboard & Music Theorem, Fine Arts
 * Validity: 3 Months (90 Days) from date of enrollment
 */

export const COURSES = [
  {
    id: "guitar-mastery",
    title: "Guitar Mastery: Acoustic & Contemporary Electric",
    category: "guitar",
    tagline: "From fingerstyle mechanics & harmonic theory to confident performance.",
    price: 1499,
    originalPrice: 2999,
    validityDays: 90,
    discipline: "Guitar",
    level: "Beginner to Advanced Repertoire",
    badge: "Most Popular",
    rating: 4.9,
    reviewsCount: 142,
    totalLectures: 24,
    totalHours: "16 Hours",
    description: "A comprehensive journey through acoustic and electric guitar craft. Master posture, open & barre chords, syncopated strumming rhythms, fingerstyle polyphony, pentatonic lead scales, and popular performance arrangements.",
    highlights: [
      "90-Day Full Access with Dynamic DRM Protection",
      "24 High-Definition Structured Video Lectures",
      "Fingerstyle Tabs, Chord Sheets & Practice Loops",
      "Comprehensive Music Theorem & Ear Training Integrations",
      "Direct Mentor Feedback on Recorded Submissions"
    ],
    previewVideo: {
      title: "Lecture 01: Anatomy, Tuning, String Physics & The Golden Posture",
      duration: "14:20",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      poster: "assets/guitar_class.jpg",
      notes: "Welcome to resynk Guitar Mastery. In this opening masterclass, we dissect guitar anatomy, proper fret hand thumb placement, and how to eliminate fret buzz from day one."
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
    title: "Keyboard & Music Theorem Masterclass",
    category: "keyboard",
    tagline: "Harmonic architecture, sight-reading, chord inversions & two-hand sync.",
    price: 1499,
    originalPrice: 2999,
    validityDays: 90,
    discipline: "Keyboard & Theory",
    level: "Beginner to Intermediate Harmonic Mastery",
    badge: "Theory Certified",
    rating: 4.95,
    reviewsCount: 118,
    totalLectures: 28,
    totalHours: "18 Hours",
    description: "Built upon the rigorous curriculum of D Paul’s Academy Certified Comprehensive Music Theorem. Learn keyboard layout, scale construction, chord voicings, inversions, left-hand bass accompaniment, and harmonic improvisation.",
    highlights: [
      "90-Day Full Access with Anti-Recording Watermark",
      "Certified Music Theorem & Western Classical Harmony",
      "Two-Hand Independence Exercises & Lead Sheet Reading",
      "Chord Inversion Formulas & Modern Pop Accompaniments",
      "Course Certificate from D Paul’s Academy upon Completion"
    ],
    previewVideo: {
      title: "Lecture 01: Piano Geography, Octaves & Hand Independence",
      duration: "16:40",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      poster: "assets/keyboard_class.jpg",
      notes: "Demystifying the 88 keys through the twin-black and triple-black pattern. Natural curvature of the fingers and preventing wrist fatigue."
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
    tagline: "Classical sketching, tonal shading, color theory, portraiture & acrylics.",
    price: 1299,
    originalPrice: 2499,
    validityDays: 90,
    discipline: "Fine Arts",
    level: "All Levels (Child to Adult)",
    badge: "Creative Studio",
    rating: 4.92,
    reviewsCount: 89,
    totalLectures: 20,
    totalHours: "14 Hours",
    description: "Explore your creative voice through structured visual disciplines. Master graphite pencil grades, charcoal blending, light source dynamics, two-point perspective, watercolor washes, and acrylic canvas composition.",
    highlights: [
      "90-Day Full Access with Protected Visual Lectures",
      "Pencil Grading (2H–8B) & Charcoal Blending Techniques",
      "Perspective, Proportions & Human Portrait Geometry",
      "Color Temperature & Acrylic Canvas Composition",
      "Personalized Artwork Critique Submission Guidelines"
    ],
    previewVideo: {
      title: "Lecture 01: The Grammar of Line, Grip & Pencil Grades (2H to 8B)",
      duration: "15:10",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      poster: "assets/fine_arts_class.jpg",
      notes: "Understanding graphite hardness, cross-hatching, stippling, and continuous tonal gradients."
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
  },
  {
    id: "all-access-pass",
    title: "resynk Triad Master Pass (Guitar + Keyboard + Fine Arts)",
    category: "bundle",
    tagline: "The complete multidisciplinary academy pass for ambitious artists.",
    price: 2999,
    originalPrice: 5997,
    validityDays: 90,
    discipline: "All 3 Disciplines Included",
    level: "Complete Conservatory Access",
    badge: "Best Value (Save ₹2,998)",
    rating: 5.0,
    reviewsCount: 204,
    totalLectures: 72,
    totalHours: "48 Hours",
    description: "Full, unrestricted 90-day access to all three masterclasses at resynk: Guitar Mastery, Keyboard & Music Theorem, and Fine Arts Studio. Includes unified curriculum navigation, priority mentor reviews, and individual completion certificates.",
    highlights: [
      "90-Day Full Access Across ALL 3 Disciplines",
      "72 In-Depth Video Lectures with Zero Ads",
      "Includes D Paul’s Academy Certified Music Theorem Course",
      "Protected Player with Dynamic Anti-Recording Forensic Watermark",
      "Full Suite of Practice Sheets, Reference Photos & Audio Tracks",
      "Huge Savings: All 3 for ₹2,999 (Regular ₹5,997)"
    ],
    previewVideo: {
      title: "Academy Overview & Multi-Instrument Synergy",
      duration: "10:15",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      poster: "assets/keyboard_class.jpg",
      notes: "How studying visual arts and music theory simultaneously elevates your ear, spatial awareness, and creative discipline."
    },
    modules: [] // Unlocks all modules from the 3 courses
  }
];

export const FOUNDER_PORTFOLIO = {
  name: "Master Reynole",
  academy: "D Paul’s Academy",
  foundedYear: "2014",
  role: "Founder / Director — D Paul’s Academy",
  motto: "Dance • Learn • Grow",
  overview: "Dedicated to holistic arts and music education since 2014. Cultivating technical mastery, psychological mindfulness, and creative rhythm across thousands of students in Bangalore’s premier schools, colleges, and gated communities.",
  educationAndCertifications: [
    { title: "BA Sociology", detail: "Foundational understanding of community development and social harmony through arts." },
    { title: "PGDP in Psychology", detail: "Post Graduate Diploma in Psychology applying empathetic pedagogical methods for young and adult learners." },
    { title: "International Certified Happiness Coach", detail: "Integrating music and expressive arts as instruments for well-being, joy, and emotional resilience." },
    { title: "Certified Comprehensive Music Theorem", detail: "Deep classical & contemporary harmonic music theory, structural composition, and sight performance." }
  ],
  awards: [
    { title: "Seva Bhushan Puraskar Award", level: "State Level Honor", description: "Recognizing outstanding societal contribution through arts, cultural enrichment, and educational outreach." },
    { title: "Best Empowering Choreographer", level: "Awarded by Swing", description: "Honoring innovative choreography and youth empowerment in dynamic movement & rhythm." },
    { title: "Coherence Appreciation Award", level: "Artistic Distinction", description: "Celebrated for multidisciplinary artistic coherence and sustained educational leadership." }
  ],
  judgingAndAppearances: [
    { institution: "St Francis PU College", type: "Guest Judge & Chief Guest (×2)", note: "Annual cultural fest & inter-college arts competition adjudication." },
    { institution: "Santa Fest by Swing", type: "Keynote & Guest Judge", note: "Statewide winter performing arts showcase." },
    { institution: "St Anne’s College PU College", type: "Guest Judge & Cultural Advisor (×2)", note: "Youth talent discovery & annual day ceremonies." },
    { institution: "St Anne’s Women’s Degree College", type: "Distinguished Guest & Judge", note: "Inter-collegiate dance, rhythm, and arts conclave." },
    { institution: "St Francis Xavier Degree College", type: "Judge & Performance Mentor", note: "Performing arts festival adjudication." },
    { institution: "United College", type: "Guest Speaker & Arts Adjudicator", note: "Annual university cultural festival." }
  ],
  majorEvents: [
    { title: "Survana Karnataka Varnangal Event", years: "2016, 2017, 2018, 2023, 2024", highlight: "Statewide grand cultural festival celebrating heritage, rhythm, and artistic expressions." },
    { title: "Swing Event", years: "2018, 2019", highlight: "Choreography director & artistic lead for signature youth gatherings." },
    { title: "Global Thinkers Summit Events", years: "2017 & 2018", highlight: "Cultural entertainment coordination and creative presentations." },
    { title: "Corporate Cultural Events — Mphasis", years: "2015", highlight: "Corporate team building, choreography, and rhythm workshops." },
    { title: "Corporate Cultural Events — IBM", years: "2014", highlight: "Large-scale annual cultural showcase for IBM Bangalore." },
    { title: "Community Food Fests & Wedding Galas", years: "Ongoing", highlight: "Musical choreography, creative direction, and live cultural performances." }
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
    instagram: "@Master_reynole",
    instagramUrl: "https://www.instagram.com/Master_reynole",
    youtube: "@Dpauls_academy",
    youtubeUrl: "https://www.youtube.com/@Dpauls_academy",
    phone: "910 839 6010",
    phoneCallable: "+919108396010",
    location: "Kothanur, Bangalore, Karnataka, India"
  }
};
