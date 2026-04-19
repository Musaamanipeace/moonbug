
// All calculations are approximate and for entertainment purposes.
// They do not account for leap seconds, timezones, or orbital irregularities.

const LUNAR_CYCLE_DAYS = 29.530588853;
const SYNODIC_MONTH_MS = LUNAR_CYCLE_DAYS * 24 * 60 * 60 * 1000;
// A more standard astronomical epoch: Jan 6, 2000, 18:14 UTC
const NEW_MOON_EPOCH = new Date('2000-01-06T18:14:00Z').getTime();
// A full moon near the new epoch: Jan 21, 2000, 04:41 UTC
const FULL_MOON_EPOCH = new Date('2000-01-21T04:41:00Z').getTime();

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

const LUNAR_MONTH_NAMES = [
  'First Moon', 'Second Moon', 'Third Moon', 'Fourth Moon', 'Fifth Moon', 'Sixth Moon',
  'Seventh Moon', 'Eighth Moon', 'Ninth Moon', 'Tenth Moon', 'Eleventh Moon', 'Twelfth Moon'
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
 * Calculates the number of full moons visible since a given birth date.
 * @param startDate The user's birth date.
 * @returns The number of full moons.
 */
export function countFullMoonsSince(startDate: Date): number {
    const now = new Date();
    if (startDate.getTime() > now.getTime()) return 0;

    // Find the first full moon *after* or on the birth date.
    let nextFullMoon = FULL_MOON_EPOCH;
    if (startDate.getTime() > nextFullMoon) {
        // Move forward to the cycle containing the birth date
        const diff = startDate.getTime() - nextFullMoon;
        const cycles = Math.ceil(diff / SYNODIC_MONTH_MS);
        nextFullMoon += cycles * SYNODIC_MONTH_MS;
    } else {
        // Move backward to the cycle before the birth date
         while (nextFullMoon > startDate.getTime()) {
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
 * Calculates the number of new moons since a given start date.
 * @param startDate The date to start counting from.
 * @returns The total number of new moons.
 */
export function countNewMoonsSince(startDate: Date): number {
    const now = new Date();
    if (startDate.getTime() > now.getTime()) return 0;

    // Find the first new moon *after* or on the start date.
    let nextNewMoon = NEW_MOON_EPOCH;
    if (startDate.getTime() > nextNewMoon) {
        // Move forward to the cycle containing the start date
        const diff = startDate.getTime() - nextNewMoon;
        const cycles = Math.ceil(diff / SYNODIC_MONTH_MS);
        nextNewMoon += cycles * SYNODIC_MONTH_MS;
    } else {
        // Move backward to the cycle before the start date
         while (nextNewMoon > startDate.getTime()) {
            nextNewMoon -= SYNODIC_MONTH_MS;
        }
        // And then forward one to be the first new moon *after* the start date
        nextNewMoon += SYNODIC_MONTH_MS;
    }

    // Now count how many new moons from that point until now
    if (nextNewMoon > now.getTime()) return 0;
    
    const moonsSinceFirst = (now.getTime() - nextNewMoon) / SYNODIC_MONTH_MS;
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

/**
 * Finds the date of the first new moon on or after a given date.
 * @param startDate The date to start searching from.
 * @returns The Date of the first new moon.
 */
function getNextNewMoon(startDate: Date): Date {
  const timeSinceEpoch = startDate.getTime() - NEW_MOON_EPOCH;
  const cyclesSinceEpoch = timeSinceEpoch / SYNODIC_MONTH_MS;
  const nextCycle = Math.ceil(cyclesSinceEpoch);
  const nextNewMoonTime = NEW_MOON_EPOCH + nextCycle * SYNODIC_MONTH_MS;
  return new Date(nextNewMoonTime);
}

/**
 * Calculates information about the lunar year for a given date.
 * A lunar year is defined as the 12 new moons following the first new moon of the Gregorian year.
 * @param date The date to get the lunar year for.
 * @returns An object describing the lunar year.
 */
export function getLunarYearDetails(date: Date) {
  const gregorianYear = date.getFullYear();
  const yearStart = new Date(gregorianYear, 0, 1);
  
  const lunarYearStart = getNextNewMoon(yearStart);
  
  const months = [];
  let currentMoon = lunarYearStart;
  for (let i = 0; i < 12; i++) {
    const nextMoon = new Date(currentMoon.getTime() + SYNODIC_MONTH_MS);
    months.push({
      month: i + 1,
      name: LUNAR_MONTH_NAMES[i],
      startDate: currentMoon,
      endDate: nextMoon,
    });
    currentMoon = nextMoon;
  }
  
  const lunarYearEnd = months[11].endDate;
  
  return {
    gregorianYear,
    lunarYearStart,
    lunarYearEnd,
    months,
  };
}


/**
 * Calculates the lunar date (month, day) for a given Gregorian date.
 * @param date The Gregorian date.
 * @returns An object with the lunar date information, or null if it's an intercalary day.
 */
export function getLunarDate(date: Date) {
    const details = getLunarYearDetails(date);

    // Handle dates that fall before the start of the calculated lunar year.
    // This happens for dates in January before the first new moon.
    if (date < details.lunarYearStart) {
        const prevYearDetails = getLunarYearDetails(new Date(date.getFullYear() - 1, 11, 31));
        for (const month of prevYearDetails.months) {
            if (date >= month.startDate && date < month.endDate) {
                const dayOfMonth = Math.floor((date.getTime() - month.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return {
                    lunarYear: prevYearDetails.gregorianYear,
                    lunarMonth: month.month,
                    lunarDay: dayOfMonth,
                    monthName: month.name,
                };
            }
        }
    }

    // Handle dates within the primary calculated lunar year.
    for (const month of details.months) {
        if (date >= month.startDate && date < month.endDate) {
            const dayOfMonth = Math.floor((date.getTime() - month.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return {
                lunarYear: details.gregorianYear,
                lunarMonth: month.month,
                lunarDay: dayOfMonth,
                monthName: month.name,
            };
        }
    }

    return null; // Should not happen for valid dates
}

/**
 * Calculates a symbolic, generational time based on full moon cycles since 1 AD.
 * In this system: 1 "Lunar Year" = 1 Full Moon Cycle. 1 "Generation" = 12 Cycles.
 * @param date The current date.
 * @returns An object with tenth generation, generation, and lunar year.
 */
export function calculateGenerationalTime(date: Date) {
  const AD_EPOCH = new Date('0001-01-01T00:00:00Z').getTime();

  // Find the first full moon on or after 1 AD.
  let firstFullMoonAfterEpoch = FULL_MOON_EPOCH;
  while (firstFullMoonAfterEpoch > AD_EPOCH) {
    firstFullMoonAfterEpoch -= SYNODIC_MONTH_MS;
  }
  // The loop goes one step too far, so add it back.
  firstFullMoonAfterEpoch += SYNODIC_MONTH_MS;
  
  const timeSinceFirstMoon = date.getTime() - firstFullMoonAfterEpoch;
  if (timeSinceFirstMoon < 0) {
    return { tenthGeneration: 1, generation: 1, lunarYear: 1 };
  }

  const totalCycles = Math.floor(timeSinceFirstMoon / SYNODIC_MONTH_MS);

  const tenthGeneration = Math.floor(totalCycles / 120) + 1;
  const generation = Math.floor((totalCycles % 120) / 12) + 1;
  const lunarYear = (totalCycles % 12) + 1;

  return { tenthGeneration, generation, lunarYear };
}
