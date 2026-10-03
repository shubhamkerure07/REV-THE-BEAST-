export interface AudioProfileManifestEntry {
  id: string;
  engine: string;
  cylinderLayout: string;
  firingOrder: string;
  soundCharacter: string;
  forcedInduction: string;
  source: string;
  license: string;
}

export const AUDIO_MANIFEST: AudioProfileManifestEntry[] = [
  {
    id: 'coyote-v8',
    engine: 'Ford 5.0L Coyote Ti-VCT Cross-Plane V8',
    cylinderLayout: '90° V8 Cross-Plane Crank',
    firingOrder: '1-5-4-8-6-3-7-2 (90°-180°-270°-180° asymmetric intervals)',
    soundCharacter: 'Deep American muscle lope at idle, guttural bass thump, throaty 7,500 RPM roar',
    forcedInduction: 'Naturally Aspirated',
    source: 'Physical combustion modeling with cross-plane dual-bank acoustic scavenging simulation',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 's58-inline6',
    engine: 'BMW S58 TwinPower Turbo 3.0L Inline-6',
    cylinderLayout: 'Longitudinal Inline-6',
    firingOrder: '1-5-3-6-2-4 (120° even harmonic balance)',
    soundCharacter: 'High-frequency German metallic rasp, whistling ceramic ball-bearing twin turbos, overrun crackle',
    forcedInduction: 'Twin-Turbo (24.7 PSI)',
    source: 'Combustion pulse modeling with dual 3-cylinder exhaust manifold comb filter',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'amg-v8',
    engine: 'Mercedes-AMG M177 4.0L Biturbo V8',
    cylinderLayout: '90° Hot-Inside-V V8',
    firingOrder: '1-8-2-7-4-5-3-6',
    soundCharacter: 'Guttural AMG side-pipe thunder, heavy sub-bass pressure, explosive backfires',
    forcedInduction: 'Biturbo Hot-Inside-V (21.8 PSI)',
    source: 'Low-frequency sub-harmonic pulse modeling with exhaust chamber resonance',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'supercharged-i4',
    engine: 'Kawasaki Ninja H2R 998cc Supercharged Inline-4',
    cylinderLayout: 'Transverse Inline-4',
    firingOrder: '1-2-4-3 (180° firing)',
    soundCharacter: '14,000 RPM hyper-screamer, planetary supercharger gear whine (9.2x impeller ratio), blow-off valve flutter (STU-TU-TU)',
    forcedInduction: 'Planetary Centrifugal Supercharger (35.0 PSI)',
    source: 'High-harmonic scream modeling with FM gear-whine & modulated compressor surge',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'ferrari-v8',
    engine: 'Ferrari F154 3.9L Twin-Turbo Flat-Plane V8',
    cylinderLayout: '90° Flat-Plane Crank V8',
    firingOrder: '1-8-3-6-4-5-2-7 (180° even firing)',
    soundCharacter: 'Sharp high-pitched Italian exotic wail, instantaneous throttle response, razor-edge bark',
    forcedInduction: 'Twin-Turbo (28.5 PSI)',
    source: '180° flat-plane harmonic synthesis with rapid transient rise',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'bugatti-w16',
    engine: 'Bugatti 8.0L Quad-Turbo W16',
    cylinderLayout: 'W16 (Dual VR8 Blocks)',
    firingOrder: '1-14-9-4-7-12-15-6-13-8-3-16-11-2-5-10 (45° intervals)',
    soundCharacter: 'Massive 16-cylinder deep jet-turbine roar, continuous oceanic sound wall, quad-spool air rush',
    forcedInduction: 'Quad-Turbo (40.0 PSI)',
    source: '16-cylinder multi-phase impulse synthesis with quad air velocity modeling',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'v10-exotic',
    engine: 'Lamborghini 5.2L Naturally Aspirated V10',
    cylinderLayout: '90° V10 Even-Firing',
    firingOrder: '1-6-5-10-2-7-3-8-4-9 (72° intervals)',
    soundCharacter: 'Exotic high-revving 5th harmonic F1 acoustic howl, screaming 8,500 RPM crescendo',
    forcedInduction: 'Naturally Aspirated',
    source: '72° 5th-harmonic resonant acoustic modeling with titanium pipe standing wave',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'v12-symphony',
    engine: 'Beast AI 6.5L Naturally Aspirated V12',
    cylinderLayout: '60° V12 Symphony',
    firingOrder: '1-12-4-9-2-11-6-7-3-10-5-8 (60° intervals)',
    soundCharacter: 'Velvety smooth, ultra-dense harmonic choir, screaming 9,000 RPM spine-tingling crescendo',
    forcedInduction: 'Naturally Aspirated',
    source: '60° 6th-harmonic physical combustion synthesis (Game Sound Design)',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'electric-motor',
    engine: 'Beast EV Quad Permanent Magnet Synchronous Motors',
    cylinderLayout: 'Solid-State Quad Electric Drive (N/A)',
    firingOrder: '3-Phase High-Frequency Inverter Switching (N/A)',
    soundCharacter: 'Futuristic IGBT inverter whine (10-16 kHz), planetary reduction gear acceleration whine, regenerative deceleration hum',
    forcedInduction: 'None (Pure Electric)',
    source: 'High-frequency PWM carrier synthesis & planetary reduction gear Doppler simulation',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
  {
    id: 'parallel-twin-270',
    engine: 'Royal Enfield 648cc Parallel Twin 270°',
    cylinderLayout: 'Parallel Twin with 270° Crossplane Crank',
    firingOrder: '270° / 450° offset firing',
    soundCharacter: 'Throaty cafe racer pea-shooter thump, rhythmic British cadence, raw mechanical valve tick',
    forcedInduction: 'Naturally Aspirated',
    source: 'Asymmetrical 270° twin pulse synthesis with exhaust megaphone acoustics',
    license: 'Original procedural sound design (REV-THE-BEAST audio engine)',
  },
];
