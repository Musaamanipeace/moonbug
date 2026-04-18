
// All calculations are approximate and for entertainment purposes.
// They do not account for leap seconds, timezones, or orbital irregularities.

const LUNAR_CYCLE_DAYS = 29.530588853;
const SYNODIC_MONTH_MS = LUNAR_CYCLE_DAYS * 24 * 60 * 60 * 1000;
// A known new moon: Jan 21, 2023, 20:53 UTC
const NEW_MOON_EPOCH = new Date('2023-01-21T20:53:00Z').getTime();
// A known full moon: Jan 6, 2023, 23:08 UTC
const FULL_MOON_EPOCH = new Date('2023-01-06T23:08:00Z').getTime();

const PHASE_LENGTH_MS = SYNODIC_MONTH_MS / 8;
// Epoch of the first transition after the reference new moon (New Moon -> Waxing Crescent) is at 1/16th of a cycle
const TRANSITION_EPOCH = NEW_MOON_EPOCH + (SYNODIC_MONTH_MS / 16);


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

    // Find the first full moon *after* or on the birth date.
    let nextFullMoon = FULL_MOON_EPOCH;
    if (birthDate.getTime() > nextFullMoon) {
        // Move forward to the cycle containing the birth date
        const diff = birthDate.getTime() - nextFullMoon;
        const cycles = Math.ceil(diff / SYNODIC_MONTH_MS);
        nextFullMoon += cycles * SYNODIC_MONTH_MS;
    } else {
        // Move backward to the cycle before the birth date
         while (nextFullMoon > birthDate.getTime()) {
            nextFullMoon -= SYNODIC_MONTH_MS;
        }
        // And then forward one to be the first full moon *after* the birthdate
        nextFullMoon += SYNODIC_MONTH_MS;
    }


    // Now count how many full moons from that point until now
    if (nextFullMoon > now.getTime()) return 0;
    
    const moonsSinceFirst = (now.getTime() - nextFullMoon) / SYNODIC_MONTH_MS;
    return 1 + Math.floor(moonsSinceFirst);
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
    return 'Winter';
  } else {
    // Covers winter, including year-end and start of new year
    return 'Winter';
  }
}

/**
 * Calculates the number of lunar cycles between two dates.
 * @param startDate The start date.
 * @param endDate The end date.
 * @returns The number of lunar cycles.
 */
export function calculateLunarCyclesBetween(startDate: Date, endDate: Date): number {
  const diffInMillis = endDate.getTime() - startDate.getTime();
  if (diffInMillis < 0) return 0;
  return diffInMillis / SYNODIC_MONTH_MS;
}


/**
 * Provides a simplified, entertaining description of the moon's position.
 * @param date The current date and time.
 * @param phaseValue The current moon phase value (0-1).
 * @returns A string describing the moon's visibility.
 */
export function getMoonPosition(date: Date, phaseValue: number): string {
  const hour = date.getHours();

  // Is it daytime? (approx. 6 AM to 6 PM)
  const isDaytime = hour > 6 && hour < 18;

  // Approx time of next visibility
  const nextRise = isDaytime ? "this evening" : "tomorrow morning";

  // New Moon (phase ~0 or ~1) is not visible
  if (phaseValue < 0.03 || phaseValue > 0.97) {
    return `Not visible. Rises again ${nextRise}.`;
  }
  
  if (isDaytime) {
      // The moon is often visible during the day, especially around quarter phases.
      if (phaseValue > 0.2 && phaseValue < 0.8) {
        return "Faintly visible in the day sky.";
      }
      return `Not visible. Rises again ${nextRise}.`;
  }

  // At night, the moon is generally visible if it's not a new moon.
  // We can add a little more flavor.
  if (hour > 18 && hour < 22) {
      return "Rising in the eastern sky.";
  } else if (hour >= 22 || hour < 2) {
      return "High in the night sky.";
  } else if (hour >=2 && hour < 6) {
      return "Setting in the western sky.";
  }

  return "Visible in the night sky.";
}

/**
 * Calculates the time since the current lunar phase began and until it transitions.
 * @param date The date to calculate from.
 * @returns An object with elapsed and remaining time in hours.
 */
export function getPhaseTransitionTimes(date: Date): { elapsedHours: number; remainingHours: number } {
  const timeSinceTransitionEpoch = date.getTime() - TRANSITION_EPOCH;
  
  const timeIntoCurrentPhaseMs = timeSinceTransitionEpoch % PHASE_LENGTH_MS;
  // Ensure the result is positive
  const positiveTimeIntoCurrentPhaseMs = timeIntoCurrentPhaseMs < 0 ? timeIntoCurrentPhaseMs + PHASE_LENGTH_MS : timeIntoCurrentPhaseMs;
  
  const timeRemainingMs = PHASE_LENGTH_MS - positiveTimeIntoCurrentPhaseMs;

  const elapsedHours = positiveTimeIntoCurrentPhaseMs / (1000 * 60 * 60);
  const remainingHours = timeRemainingMs / (1000 * 60 * 60);
  
  return { elapsedHours, remainingHours };
}
