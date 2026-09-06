import { CarModelType, CameraPreset } from '../types';

export interface VehiclePhotoAngle {
  id: CameraPreset;
  title: string;
  subtitle: string;
  url: string;
  thumbnail: string;
  hotspots?: Array<{
    id: string;
    label: string;
    x: number; // percentage from left
    y: number; // percentage from top
    action: 'exhaust' | 'engine' | 'interior' | 'wheel' | 'lights';
  }>;
}

export interface VehicleVideoReel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
}

export interface VehicleMediaData {
  id: CarModelType;
  name: string;
  tagline: string;
  category: 'Coupé' | 'Muscle' | 'SUV' | 'Hyperbike' | 'Executive Sedan' | 'Supercar' | 'Hypercar' | 'Cafe Racer' | 'Custom Bobber';
  brand: string;
  badge: string;
  accentHex: string;
  photos: Record<CameraPreset, VehiclePhotoAngle>;
  videos: VehicleVideoReel[];
  keySpecs: {
    engine: string;
    horsepower: string;
    torque: string;
    zeroToSixty: string;
    topSpeed: string;
    soundType: string;
  };
}

export const VEHICLE_MEDIA_CATALOG: Record<CarModelType, VehicleMediaData> = {
  'procedural-m4': {
    id: 'procedural-m4',
    name: 'BMW M4 Competition Coupé',
    tagline: 'High-Performance Motorsport Icon',
    category: 'Coupé',
    brand: 'BMW M',
    badge: 'M POWER',
    accentHex: '#3b82f6',
    keySpecs: {
      engine: '3.0L S58 Twin-Turbo Inline-6',
      horsepower: '503 HP @ 6,250 RPM',
      torque: '479 lb-ft @ 2,750 RPM',
      zeroToSixty: '3.4 sec',
      topSpeed: '290 km/h (180 mph)',
      soundType: 'Metallic rasp with twin-turbo whistle & overrun burble',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Front 3/4 Dynamic Angle',
        subtitle: 'Isle of Man Green metallic paint with frameless M kidney grille',
        url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'm4-hood', label: 'S58 3.0L Twin-Turbo Hood', x: 42, y: 56, action: 'engine' },
          { id: 'm4-lights', label: 'M Laserlight Optics', x: 28, y: 58, action: 'lights' },
          { id: 'm4-wheel', label: '19"/20" M Forged Wheels', x: 22, y: 78, action: 'wheel' },
        ],
      },
      front: {
        id: 'front',
        title: 'Aggressive Front Fascia',
        subtitle: 'Vertical cooling ducts and sculpted carbon hood',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'm4-front-engine', label: 'Twin-Turbocharged Core', x: 50, y: 48, action: 'engine' },
        ],
      },
      rear: {
        id: 'rear',
        title: 'Quad Exhaust Rear Diffuser',
        subtitle: 'Four 100mm black chrome tips with active flap acoustic valves',
        url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'm4-exhaust-fire', label: 'Quad Exhaust (Click for Backfire)', x: 48, y: 82, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'M Carbon Bucket Seat Cockpit',
        subtitle: 'Merino leather, M leather steering wheel & red M buttons',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'm4-wheel-cockpit', label: 'Paddle Shifters & Drive Mode', x: 45, y: 62, action: 'exhaust' },
        ],
      },
      side: {
        id: 'side',
        title: 'Aerodynamic Side Profile',
        subtitle: 'Carbon roofline, M gills & flared rear haunches',
        url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: 'S58 3.0L Twin-Turbocharged Engine Bay',
        subtitle: '3D-printed cylinder head core with twin mono-scroll turbos',
        url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: 'M Light Alloy Forged Wheels',
        subtitle: 'Double-spoke style with 6-piston fixed caliper ceramic rotor',
        url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Aerial View & Carbon Roof',
        subtitle: 'Weight-saving CFRP roof with central aerofoil channel',
        url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'm4-track-clip',
        title: 'M4 Competition Track Attack & Exhaust Spool',
        description: 'Full-throttle launch and aggressive overrun sound around the curves',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-race-track-40332-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1280&q=80',
        duration: '0:32',
      },
      {
        id: 'm4-launch-clip',
        title: '0-100 km/h Launch Control Run',
        description: 'M xDrive launch sequence with instant gear shifts',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-fast-on-a-highway-at-night-42285-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1280&q=80',
        duration: '0:24',
      },
    ],
  },

  'mustang-gt': {
    id: 'mustang-gt',
    name: 'Ford Mustang GT Fastback',
    tagline: '5.0L Naturally Aspirated American Muscle',
    category: 'Muscle',
    brand: 'Ford Performance',
    badge: 'COYOTE 5.0',
    accentHex: '#f59e0b',
    keySpecs: {
      engine: '5.0L Ti-VCT Coyote V8',
      horsepower: '480 HP @ 7,150 RPM',
      torque: '415 lb-ft @ 4,900 RPM',
      zeroToSixty: '4.2 sec',
      topSpeed: '250 km/h (155 mph)',
      soundType: 'Deep cross-plane V8 lope with throaty high-RPM bark',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Aggressive Fastback Silhouette',
        subtitle: 'Signature tri-bar LED lighting & functional hood heat extractors',
        url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'mustang-hood', label: 'Coyote 5.0L V8 Under Hood', x: 46, y: 52, action: 'engine' },
          { id: 'mustang-brakes', label: 'Brembo 6-Piston Brakes', x: 26, y: 72, action: 'wheel' },
        ],
      },
      front: {
        id: 'front',
        title: 'Intimidating Front Grille & Splitter',
        subtitle: 'Pony emblem flanked by tri-bar daytime running lamps',
        url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=75',
      },
      rear: {
        id: 'rear',
        title: 'Sequential Tri-Bar Taillamps & Quad Exhaust',
        subtitle: 'Active valve performance exhaust with 4 distinct acoustic modes',
        url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'mustang-rear-rev', label: 'Quad Active Exhaust (Rev V8)', x: 50, y: 78, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'Driver-Centric Cockpit & Digital Cluster',
        subtitle: '12.4-inch digital instrument cluster with Track Apps',
        url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Muscular Fastback Roofline',
        subtitle: 'Broad rear fenders, side ground effects & GT badging',
        url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: 'Gen-4 5.0-Liter Coyote DOHC V8',
        subtitle: 'Dual throttle body intake manifold with cross-plane steel crank',
        url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: '19-Inch Ebony Black Aluminum Wheels',
        subtitle: 'Wrapped in Pirelli P Zero high-performance summer compound',
        url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Overhead Muscle Profile',
        subtitle: 'Sculpted hood extraction lines and tapered decklid',
        url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'mustang-burnout-clip',
        title: 'Mustang GT Line-Lock Burnout & V8 Roar',
        description: 'Electronic line-lock tire warmup with full active exhaust roar',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-race-track-40332-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1280&q=80',
        duration: '0:28',
      },
    ],
  },

  'gwagon-g63': {
    id: 'gwagon-g63',
    name: 'Mercedes-AMG G63 G-Wagon',
    tagline: 'Handcrafted 4.0L Biturbo V8 Luxury Titan',
    category: 'SUV',
    brand: 'Mercedes-AMG',
    badge: 'AMG BITURBO',
    accentHex: '#e11d48',
    keySpecs: {
      engine: '4.0L Handcrafted AMG Biturbo V8',
      horsepower: '577 HP @ 6,000 RPM',
      torque: '627 lb-ft @ 2,500 RPM',
      zeroToSixty: '3.9 sec',
      topSpeed: '240 km/h (149 mph)',
      soundType: 'Thunderous AMG side-pipe bass rumble with gunshot cracks',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Iconic Boxy AMG Panamericana Stance',
        subtitle: 'Vertical chrome grille, flared fenders and LED ring lamps',
        url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'g63-exhaust', label: 'Side-Exit Dual Exhaust Pipes', x: 68, y: 76, action: 'exhaust' },
          { id: 'g63-engine', label: 'AMG M177 Handcrafted Biturbo V8', x: 42, y: 55, action: 'engine' },
        ],
      },
      front: {
        id: 'front',
        title: 'Commanding Front Panamericana Grille',
        subtitle: 'High ground clearance with heavy-duty bash guards',
        url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=75',
      },
      rear: {
        id: 'rear',
        title: 'Full-Size Door-Mounted Spare Wheel',
        subtitle: 'Stainless steel cover ring with embossed Mercedes star & side exhaust',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'g63-side-pipes', label: 'Side-Exit AMG Pipes', x: 35, y: 82, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'G manufaktur Exclusive Luxury Cabin',
        subtitle: 'Dual 12.3-inch widescreen displays & AMG performance steering wheel',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Classic Upright Profile & Flared Arches',
        subtitle: 'Stainless steel running boards and side-exit exhaust tips',
        url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: 'Handcrafted AMG 4.0L "Hot-V" Biturbo V8',
        subtitle: 'Signed by master AMG engine technician in Affalterbach',
        url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: '22-Inch AMG Cross-Spoke Forged Wheels',
        subtitle: 'Matte black with high-sheen rim flange and red AMG calipers',
        url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Flat Roof with Electric Sunroof',
        subtitle: 'Heavy-duty steel construction with protective roof rub strips',
        url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'g63-city-cruise',
        title: 'G63 AMG Night Cruise & Cold Start',
        description: 'Visceral side-pipe acoustic rumble in urban night ambiance',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-fast-on-a-highway-at-night-42285-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1280&q=80',
        duration: '0:22',
      },
    ],
  },

  'ninja-h2r': {
    id: 'ninja-h2r',
    name: 'Kawasaki Ninja H2R Superbike',
    tagline: '310 HP Supercharged Closed-Course Weapon',
    category: 'Hyperbike',
    brand: 'Kawasaki Racing',
    badge: '14,000 RPM SC',
    accentHex: '#10b981',
    keySpecs: {
      engine: '998cc Centrifugal Supercharged I4',
      horsepower: '310 HP (326 HP with Ram-Air) @ 14,000 RPM',
      torque: '122 lb-ft @ 12,500 RPM',
      zeroToSixty: '2.5 sec',
      topSpeed: '400 km/h (249 mph)',
      soundType: '14,000 RPM hyper-screamer with supercharger blow-off flutter',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Carbon Downforce Wings & Emerald Trellis Frame',
        subtitle: 'Mirrored silver paint finish with aerospace-grade carbon fiber fairings',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'h2r-supercharger', label: 'Planetary Supercharger Unit', x: 55, y: 58, action: 'engine' },
          { id: 'h2r-exhaust', label: 'Titanium Megaphone Exhaust', x: 74, y: 72, action: 'exhaust' },
        ],
      },
      front: {
        id: 'front',
        title: 'Carbon Aerodynamic Winglets & Ram-Air Duct',
        subtitle: 'Generating over 200 lbs of high-speed downforce',
        url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=300&q=75',
      },
      rear: {
        id: 'rear',
        title: 'Aerodynamic Tail Cowl & Titanium Exhaust',
        subtitle: 'Unmuffled straight-pipe titanium megaphone exhaust designed for maximum track flow',
        url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'h2r-rev-rear', label: 'Titanium Megaphone (Rev Screamer)', x: 62, y: 65, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'Clip-On Bars & Digital Bank Angle Display',
        subtitle: 'Öhlins electronic steering damper and Brembo radial master cylinder',
        url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Single-Sided Swingarm Profile',
        subtitle: 'Direct-drive centrifugal supercharger impeller spinning at 130,000 RPM',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: 'Supercharged 998cc 16V DOHC Inline-4',
        subtitle: 'CNC-machined aluminum impeller driven by planetary gear set',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: 'Cast Star-Pattern Wheels & Brembo Stylema',
        subtitle: '330mm semi-floating discs with dual radial-mount 4-piston calipers',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Aerodynamic Spine View',
        subtitle: 'Sculpted fuel tank with silver-mirror paint technology',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'h2r-track-speed',
        title: 'Ninja H2R 400 km/h High-Speed Run',
        description: 'Planetary supercharger whine and blow-off valve flutter on deceleration',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-race-track-40332-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1280&q=80',
        duration: '0:35',
      },
    ],
  },

  'bmw-5series': {
    id: 'bmw-5series',
    name: 'BMW 5 Series M Sport Sedan',
    tagline: '3.0L B58 Twin-Scroll Executive Aerodynamic Saloon',
    category: 'Executive Sedan',
    brand: 'BMW',
    badge: 'M SPORT',
    accentHex: '#0284c7',
    keySpecs: {
      engine: '3.0L B58 Twin-Scroll Turbo I6',
      horsepower: '382 HP @ 5,800 RPM',
      torque: '369 lb-ft @ 1,800 RPM',
      zeroToSixty: '4.4 sec',
      topSpeed: '250 km/h (155 mph)',
      soundType: 'Silky smooth inline-6 purr with refined turbo spool harmonics',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Refined Executive 3/4 Stance',
        subtitle: 'Illuminated BMW Iconic Glow kidney grille & M Aerodynamics pack',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'b58-hood', label: 'B58 3.0L Twin-Scroll Core', x: 45, y: 55, action: 'engine' },
          { id: 'b58-cabin', label: 'Curved Display Cockpit', x: 55, y: 48, action: 'interior' },
        ],
      },
      front: {
        id: 'front',
        title: 'Iconic Glow Kidney Grille',
        subtitle: 'Adaptive matrix LED headlights with blue design elements',
        url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=300&q=75',
      },
      rear: {
        id: 'rear',
        title: 'Slender L-Shaped LED Taillights',
        subtitle: 'Sculpted rear apron with dual trapezoidal chrome exhaust trims',
        url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=300&q=75',
      },
      interior: {
        id: 'interior',
        title: 'BMW Interaction Bar & Curved Display',
        subtitle: 'CraftedClarity crystal controls and Bowers & Wilkins Diamond Surround',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Elongated Executive Silhouette',
        subtitle: 'Hofmeister kink and flush integrated door handles',
        url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: 'B58 3.0-Liter Twin-Scroll Turbocharged I6',
        subtitle: 'Award-winning modular inline-6 with 48V mild hybrid technology',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: '20-Inch M Aerodynamic Bicolor Wheels',
        subtitle: 'With mixed performance tires and dark blue M sport calipers',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Panoramic Sky Lounge Glass Roof',
        subtitle: 'Dynamic LED light graphics integrated into the glass',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: '5series-highway-night',
        title: '5 Series M Sport Autobahn Night Drive',
        description: 'Smooth linear turbo spool and dynamic headlight illumination',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-fast-on-a-highway-at-night-42285-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1280&q=80',
        duration: '0:25',
      },
    ],
  },

  'ferrari-sf90': {
    id: 'ferrari-sf90',
    name: 'Ferrari SF90 Stradale',
    tagline: 'Maranello Plug-in Hybrid Masterpiece',
    category: 'Supercar',
    brand: 'Ferrari',
    badge: 'SCUDERIA FERRARI',
    accentHex: '#ef4444',
    keySpecs: {
      engine: '3.9L F154 Twin-Turbo V8 + 3 Electric Motors',
      horsepower: '986 HP (1,000 CV)',
      torque: '590 lb-ft (800 Nm)',
      zeroToSixty: '2.5 sec (0-100 km/h)',
      topSpeed: '340 km/h (211 mph)',
      soundType: 'Screaming 8,000 RPM flat-plane exotic bark with electric torque fill and explosive anti-lag pops',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Front 3/4 Aerodynamic Stance',
        subtitle: 'Rosso Corsa livery with active front vortex generators & Gurney flap',
        url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'sf90-front', label: 'Matrix LED Headlights', x: 30, y: 55, action: 'lights' },
          { id: 'sf90-engine', label: 'Twin-Turbo V8 Hybrid Core', x: 58, y: 48, action: 'engine' },
          { id: 'sf90-wheel', label: 'Carbon Fiber Wheels', x: 25, y: 72, action: 'wheel' },
        ],
      },
      front: {
        id: 'front',
        title: 'Sculpted Racing Nose',
        subtitle: 'C-shaped headlights and active aerodynamic front diffuser',
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'sf90-nose', label: 'Active Aero Splitter', x: 50, y: 65, action: 'engine' },
        ],
      },
      rear: {
        id: 'rear',
        title: 'Center-Mounted Dual Exhaust Cannons',
        subtitle: 'High-mounted Inconel exhausts and patented shut-off Gurney active wing',
        url: 'https://images.unsplash.com/photo-1594978583670-99a21683cbca?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1594978583670-99a21683cbca?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'sf90-exhaust-pipe', label: 'Inconel Exhaust Cannons (Rev & Backfire)', x: 50, y: 60, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'Aeronautical Cockpit & eManettino',
        subtitle: '16-inch curved HD digital instrument cluster and touch haptic steering controls',
        url: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Compact Mid-Engine Architecture',
        subtitle: 'Lowered cab-forward profile with massive intercooler side scoops',
        url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: 'F154FA 3.9L Twin-Turbo Flat-Plane V8',
        subtitle: 'Direct injection 350-bar fuel system with 3 electric motors generating 1,000 CV',
        url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: 'Forged Diamond-Cut Lightweight Alloys',
        subtitle: 'Michelin Pilot Sport Cup 2 tires with Giallo Modena yellow calipers',
        url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Carbon-Fiber Aerodynamic Canopy',
        subtitle: 'Ultra-low center of gravity glass engine bonnet displaying the red cylinder heads',
        url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'sf90-fiorano-hotlap',
        title: 'Ferrari SF90 Track Acceleration & Anti-Lag Screams',
        description: 'Instantaneous electric torque launch into an ear-splitting 8,000 RPM V8 wail',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-racing-on-a-race-track-42284-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1280&q=80',
        duration: '0:30',
      },
    ],
  },

  'bugatti-chiron': {
    id: 'bugatti-chiron',
    name: 'Bugatti Chiron Super Sport',
    tagline: 'The 300+ MPH Quad-Turbocharged Benchmark',
    category: 'Hypercar',
    brand: 'Bugatti',
    badge: 'BUGATTI ATELIER',
    accentHex: '#0ea5e9',
    keySpecs: {
      engine: '8.0L Quad-Turbocharged 64V W16',
      horsepower: '1,578 HP (1,600 PS)',
      torque: '1,180 lb-ft (1,600 Nm)',
      zeroToSixty: '2.4 sec (0-100 km/h)',
      topSpeed: '440 km/h (273 mph)',
      soundType: 'Jet-engine turbine spool with massive 16-cylinder displacement baritone roar',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Longtail Aerodynamic Stance',
        subtitle: 'Extended rear bodywork and iconic horseshoe front grille',
        url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'chiron-grille', label: 'Horseshoe Radiator Grille', x: 42, y: 55, action: 'engine' },
          { id: 'chiron-optics', label: '8-Eye Quad-LED Lights', x: 28, y: 52, action: 'lights' },
          { id: 'chiron-caliper', label: 'Titanium Brakes', x: 24, y: 72, action: 'wheel' },
        ],
      },
      front: {
        id: 'front',
        title: 'Active Horseshoe Grille Fascia',
        subtitle: 'Air curtains directing flow through wheel arches to cool the quad radiators',
        url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'chiron-front-cool', label: 'Quad Radiator Intakes', x: 50, y: 60, action: 'engine' },
        ],
      },
      rear: {
        id: 'rear',
        title: 'Stacked Dual-Pipe Titanium Exhausts',
        subtitle: '1.6m full-width continuous LED light strip and 3D printed titanium exhausts',
        url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'chiron-pipe', label: '3D Printed Titanium Exhausts', x: 50, y: 65, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'Molsheim Handcrafted Haute Horlogerie Cabin',
        subtitle: 'Milled aluminum center spine with mechanical chronometer instrument cluster',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Iconic Signature Bugatti C-Line',
        subtitle: 'Single piece of sculpted aluminum wrapping from roof to sill',
        url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: '8.0L Quad-Turbo W16 Architectural Monster',
        subtitle: 'Four 2-stage sequential turbochargers producing 1,600 PS with twin carbon airboxes',
        url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: 'Super Sport Magnesium Aero Wheels',
        subtitle: 'Bespoke Michelin Pilot Sport Cup 2 tyres tested up to 500 km/h',
        url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Sky View Dual Glass Roof Option',
        subtitle: 'Carbon fiber central stabilizing spine and active hydraulic airbrake wing',
        url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'chiron-highspeed-run',
        title: 'Bugatti Chiron W16 High-Speed Runway Blast',
        description: 'Earth-trembling quad-turbo spool and deep jet turbine acceleration resonance',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-city-at-night-42286-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1280&q=80',
        duration: '0:28',
      },
    ],
  },

  're-gt650': {
    id: 're-gt650',
    name: 'Royal Enfield Continental GT 650',
    tagline: 'The Pure British Cafe Racer Revival',
    category: 'Cafe Racer',
    brand: 'Royal Enfield',
    badge: 'MADE LIKE A GUN',
    accentHex: '#f59e0b',
    keySpecs: {
      engine: '648cc Air/Oil-Cooled SOHC 4V Parallel Twin',
      horsepower: '47 HP @ 7,250 RPM',
      torque: '38.3 lb-ft (52 Nm) @ 5,250 RPM',
      zeroToSixty: '5.8 sec (0-100 km/h)',
      topSpeed: '170 km/h (106 mph)',
      soundType: 'Throaty 270-degree crossplane twin rumble with rich megaphone exhaust deceleration pop',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Cafe Racer Classic Stance',
        subtitle: 'Clip-on handlebars, sculpted fuel tank with knee recesses, and rear-set footpegs',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'gt650-headlight', label: 'Classic Round Headlight', x: 28, y: 48, action: 'lights' },
          { id: 'gt650-engine', label: '648cc Finned Parallel Twin', x: 50, y: 62, action: 'engine' },
          { id: 'gt650-wheel', label: '36-Spoke Aluminum Rims', x: 22, y: 75, action: 'wheel' },
        ],
      },
      front: {
        id: 'front',
        title: 'Aggressive Cafe Front Stance',
        subtitle: 'Twin analog dials, forged clip-ons, and round halogen/LED optics',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=75',
      },
      rear: {
        id: 'rear',
        title: 'Dual Upswept Chrome Megaphone Silencers',
        subtitle: 'Authentic twin reverse-cone exhaust pipes with throaty burble',
        url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'gt650-exhaust', label: 'Chrome Twin Megaphones (Rev Twin)', x: 52, y: 72, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'Twin Pod Retro Analog Cockpit',
        subtitle: 'Vintage speedometer & tachometer needles with bar-end aluminum mirrors',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Aerodynamic Horizontal Waistline',
        subtitle: 'Double cradle tubular steel frame engineered with Harris Performance',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: '648cc 270° Crossplane Parallel Twin Engine',
        subtitle: 'Polished crankcases, counterbalanced shaft for minimal vibration, and Bosch EFI',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: '18-Inch Wire-Spoked Alloy Wheels',
        subtitle: 'Ceat Zoom Cruz sport tires and Brembo ByBre 320mm front floating disc',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Monza Flip Fuel Cap & Tuck-in Cowl',
        subtitle: 'Cafe racer single racing seat with color-matched aerodynamic tail cowl',
        url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'gt650-coastal-twisties',
        title: 'Continental GT 650 Canyon Carving & Twin Exhaust Pops',
        description: 'Crisp cafe racer acceleration run with throaty 270-degree crossplane soundtrack',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-fast-on-a-curved-road-42287-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1280&q=80',
        duration: '0:22',
      },
    ],
  },

  're-shotgun650': {
    id: 're-shotgun650',
    name: 'Royal Enfield Shotgun 650',
    tagline: 'Custom Neo-Retro Bobber & Urban Destroyer',
    category: 'Custom Bobber',
    brand: 'Royal Enfield',
    badge: 'CUSTOM WORKS',
    accentHex: '#a855f7',
    keySpecs: {
      engine: '648cc SOHC 4-Valve Parallel Twin (Bobber Tune)',
      horsepower: '47 HP @ 7,250 RPM',
      torque: '38.3 lb-ft (52 Nm) @ 5,250 RPM',
      zeroToSixty: '5.9 sec (0-100 km/h)',
      topSpeed: '170 km/h (106 mph)',
      soundType: 'Deep, bassy parallel twin thrum through blacked-out peashooter twin exhausts with overrun gurgle',
    },
    photos: {
      hero: {
        id: 'hero',
        title: 'Custom Bobber Low-Slung Stance',
        subtitle: 'Floating solo seat, chopped fenders, and muscular blacked-out stance',
        url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'sg-headlight', label: 'Cast Aluminum Nacelle LED', x: 26, y: 46, action: 'lights' },
          { id: 'sg-engine', label: 'Satin Black 648cc Engine Core', x: 50, y: 64, action: 'engine' },
          { id: 'sg-exhaust', label: 'Matte Black Peashooter Pipes', x: 74, y: 76, action: 'exhaust' },
        ],
      },
      front: {
        id: 'front',
        title: 'Neo-Retro Urban Front Face',
        subtitle: 'Wide flat handlebars, cast nacelle and inverted Showa SFF-BP front forks',
        url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=300&q=75',
      },
      rear: {
        id: 'rear',
        title: 'Chopped Bobber Tail & Peashooter Exhausts',
        subtitle: 'Minimalist LED taillight pod with twin blacked-out peashooter exhaust mufflers',
        url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=300&q=75',
        hotspots: [
          { id: 'sg-pipes', label: 'Dual Peashooter Mufflers (Bobber Pop)', x: 50, y: 70, action: 'exhaust' },
        ],
      },
      interior: {
        id: 'interior',
        title: 'Minimalist Custom Rider Cockpit',
        subtitle: 'Digi-analog speedo instrument pod with Royal Enfield Tripper navigation',
        url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=300&q=75',
      },
      side: {
        id: 'side',
        title: 'Muscular Low-Slung Silhouette',
        subtitle: 'Mid-set foot controls and ergonomic bobber triangle geometry',
        url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=300&q=75',
      },
      engine: {
        id: 'engine',
        title: '648cc Parallel Twin in Satin Black Powdercoat',
        subtitle: 'Tuned for fat low-to-mid range torque delivery with bespoke 6-speed gearbox',
        url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=300&q=75',
      },
      wheel: {
        id: 'wheel',
        title: '10-Spoke Diamond-Cut Cast Alloys',
        subtitle: 'Tubeless fat profile tires (100/90-18 front, 150/70-17 rear) for planted road grip',
        url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=300&q=75',
      },
      top: {
        id: 'top',
        title: 'Custom Stenciled Teardrop Tank',
        subtitle: 'Gloss lacquer stencil badging and low-profile fuel cap',
        url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1920&q=85',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=300&q=75',
      },
    },
    videos: [
      {
        id: 'shotgun-urban-night',
        title: 'Shotgun 650 Midnight Urban Assault & Twin Rumble',
        description: 'Deep throbbing 270-degree parallel twin exhaust resonance through dark city streets',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-fast-on-a-curved-road-42287-large.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1280&q=80',
        duration: '0:26',
      },
    ],
  },
};

export function getVehicleMedia(modelType: CarModelType): VehicleMediaData {
  return VEHICLE_MEDIA_CATALOG[modelType] || VEHICLE_MEDIA_CATALOG['procedural-m4'];
}
