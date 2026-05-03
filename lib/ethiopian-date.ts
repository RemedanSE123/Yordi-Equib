/**
 * Converts a Gregorian date to Ethiopian date.
 * Based on the Julian Day Number algorithm.
 */
export function getEthiopianDate(date: Date = new Date()) {
  const gcYear = date.getFullYear();
  const gcMonth = date.getMonth() + 1;
  const gcDay = date.getDate();

  // 1. Convert Gregorian to Julian Day Number (JDN)
  let a = Math.floor((14 - gcMonth) / 12);
  let y = gcYear + 4800 - a;
  let m = gcMonth + 12 * a - 3;

  let jdn =
    gcDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // 2. Convert JDN to Ethiopian date
  // Reference point: Ethiopian epoch starts on JDN 1723856
  let r = (jdn - 1723856) % 1461;
  let n = (r % 365) + 365 * Math.floor(r / 1460);

  let etYear =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  let etMonth = Math.floor(n / 30) + 1;
  let etDay = (n % 30) + 1;

  return {
    year: etYear,
    month: etMonth,
    day: etDay,
  };
}

const ethiopianMonths = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miyazia',
  'Gunbot',
  'Sene',
  'Hamle',
  'Nehasse',
  'Pagume',
];

export function formatEthiopianDate(etDate: {
  year: number;
  month: number;
  day: number;
}) {
  return `${ethiopianMonths[etDate.month - 1]} ${etDate.day}, ${etDate.year}`;
}

export function getCurrentEthiopianDateString() {
  const etDate = getEthiopianDate();
  return formatEthiopianDate(etDate);
}
