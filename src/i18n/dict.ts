export type Lang = "en" | "bn";

export const areas = [
  "Lalmonirhat Sadar",
  "Aditmari",
  "Hatibandha",
  "Kaliganj",
  "Patgram",
] as const;

const common = {
  appName: "BiraniKothayLal",
  tagline: "লালমনিরহাটের মানুষে মিলে ইফতার/বিরানি খবরের খাতা",
  addMosque: "লোকেশন যোগ দাও",
  about: "এই সাইটের কথা",
  search: "মসজিদের নাম, ঠিকানা, এলাকা লিখো",
  allAreas: "সব এলাকা",
  list: "তালিকা",
  map: "ম্যাপ",
  trending: "চলতি খবর",
  yes: "আছে",
  no: "নাই",
  openMaps: "গুগল ম্যাপে খুলো",
  lastReport: "শেষ খবর",
  confidence: "ভরসার মান",
  votes: "ভোট",
  mostActive: "বেশি সক্রিয়",
  topYes: "সবচেয়ে বেশি আছে",
  topNo: "সবচেয়ে বেশি নাই",
};

export const dict = {
  en: common,
  bn: common,
};

export type Dict = (typeof dict)[Lang];
