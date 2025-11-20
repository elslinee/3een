interface PrayerTime {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface NextPrayerResult {
  nextPrayer: string;
  nextPrayerTime: string;
  timeRemaining: string;
}

const getNextPrayerTime = (
  prayerTimes: PrayerTime
): NextPrayerResult | null => {
  if (!prayerTimes) return null;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  // Check if today is Friday
  const isFriday = now.getDay() === 5;

  const prayers = [
    { name: "الفجر", time: prayerTimes.Fajr },
    { name: isFriday ? "الجمعة" : "الظهر", time: prayerTimes.Dhuhr },
    { name: "العصر", time: prayerTimes.Asr },
    { name: "المغرب", time: prayerTimes.Maghrib },
    { name: "العشاء", time: prayerTimes.Isha },
  ];

  // Convert prayer times to minutes and find the next one
  const prayerTimesInMinutes = prayers.map((prayer) => {
    const [hours, minutes] = prayer.time.split(":");
    return {
      name: prayer.name,
      time: prayer.time,
      minutes: parseInt(hours) * 60 + parseInt(minutes),
    };
  });

  // Find the next prayer time
  let nextPrayer = null;
  let minTimeDiff = Infinity;

  for (const prayer of prayerTimesInMinutes) {
    let timeDiff = prayer.minutes - currentTime;

    // If the prayer time has passed today, check for tomorrow
    if (timeDiff <= 0) {
      timeDiff += 24 * 60; // Add 24 hours in minutes
    }

    if (timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      nextPrayer = prayer;
    }
  }

  if (!nextPrayer) return null;

  const hoursRemaining = Math.floor(minTimeDiff / 60);
  const minutesRemaining = minTimeDiff % 60;
  const timeRemaining = `${hoursRemaining}:${minutesRemaining.toString().padStart(2, "0")}`;

  return {
    nextPrayer: nextPrayer.name,
    nextPrayerTime: nextPrayer.time,
    timeRemaining: timeRemaining,
  };
};

export default getNextPrayerTime;
