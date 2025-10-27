// All calculations are approximate and for entertainment purposes.
// They do not account for leap seconds, timezones, or orbital irregularities.

const LUNAR_CYCLE_DAYS = 29.530588853;
const SYNODIC_MONTH_MS = LUNAR_CYCLE_DAYS * 24 * 60 * 60 * 1000;
// A known new moon: Jan 21, 2023, 20:53 UTC
const NEW_MOON_EPOCH = new Date('2023-01-21T20:53:00Z').getTime();
// A known full moon: Jan 6, 2023, 23:08 UTC
const FULL_MOON_EPOCH = new Date('2023-01-06T23:08:00Z').getTime();

export const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

/**
 * Calculates the moon phase for a given date.
 * @param date The date to calculate the phase for.
 * @returns An object with the phase name, illumination percentage, and an index (0-7).
 */
export function getMoonPhase(date: Date): { phaseName: string; illumination: number; phaseIndex: number; phaseValue: number; } {
  const timeSinceEpoch = date.getTime() - NEW_MOON_EPOCH;
  const phaseValue = (timeSinceEpoch / SYNODIC_MONTH_MS) % 1;
  const normalizedPhase = phaseValue < 0 ? 1 + phaseValue : phaseValue;

  const phaseIndex = Math.floor(normalizedPhase * 8 + 0.5) % 8;

  const illumination = 0.5 * (1 - Math.cos(normalizedPhase * 2 * Math.PI));

  return {
    phaseName: MOON_PHASES[phaseIndex],
    illumination,
    phaseIndex,
    phaseValue: normalizedPhase,
  };
}

/**
 * Calculates the number of lunar cycles since a given birth date.
 * @param birthDate The user's birth date.
 * @returns The number of lunar cycles.
 */
export function calculateLunarAge(birthDate: Date): number {
  const now = new Date();
  const ageInMillis = now.getTime() - birthDate.getTime();
  if (ageInMillis < 0) return 0;
  return ageInMillis / SYNODIC_MONTH_MS;
}

/**
 * Calculates the number of full moons visible since a given birth date.
 * @param birthDate The user's birth date.
 * @returns The number of full moons.
 */
export function countFullMoons(birthDate: Date): number {
    const now = new Date();
    if (birthDate.getTime() > now.getTime()) return 0;

    let currentFullMoon = FULL_MOON_EPOCH;

    // Find first full moon on or after birth date
    while (currentFullMoon < birthDate.getTime()) {
        currentFullMoon += SYNODIC_MONTH_MS;
    }

    // Now count how many full moons from that point until now
    let count = 0;
    while(currentFullMoon < now.getTime()) {
        count++;
        currentFullMoon += SYNODIC_MONTH_MS;
    }
    
    return count;
}


/**
 * Determines the season for a given date in the Northern Hemisphere.
 * @param date The date.
 * @returns The name of the season.
 */
export function getSeason(date: Date): string {
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  
  const currentTime = date.getTime();

  // Approx. dates for equinoxes and solstices
  const springEquinox = new Date(year, 2, 20).getTime();
  const summerSolstice = new Date(year, 5, 21).getTime();
  const autumnEquinox = new Date(year, 8, 22).getTime();
  const winterSolstice = new Date(year, 11, 21).getTime();
  
  if (currentTime >= springEquinox && currentTime < summerSolstice) {
    return 'Spring';
  } else if (currentTime >= summerSolstice && currentTime < autumnEquinox) {
    return 'Summer';
  } else if (currentTime >= autumnEquinox && currentTime < winterSolstice) {
    return 'Autumn';
  } else {
    // Covers winter, including year-end and start of new year
    return 'Winter';
  }
}
