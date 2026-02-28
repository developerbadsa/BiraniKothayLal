export type Lang = "en" | "bn";

export const areas = [
  "Lalmonirhat Sadar",
  "Aditmari",
  "Hatibandha",
  "Kaliganj",
  "Patgram",
] as const;

export const dict = {
  en: {
    appName: "BiraniKothayLal",
    tagline: "Community iftar/biriyani tracker for Lalmonirhat",
    addMosque: "Add Mosque",
    about: "About",
    search: "Search by name, address, area",
    allAreas: "All areas",
    list: "List",
    map: "Map",
    trending: "Trending",
    yes: "YES",
    no: "NO",
    openMaps: "Open in Google Maps",
    lastReport: "Last report",
    confidence: "Confidence",
    votes: "votes",
    mostActive: "Most active",
    topYes: "Top YES",
    topNo: "Top NO",
  },
  bn: {
    appName: "BiraniKothayLal",
    tagline: "লালমনিরহাটের কমিউনিটি ইফতার/বিরিয়ানি ট্র্যাকার",
    addMosque: "মসজিদ যোগ করুন",
    about: "সম্পর্কে",
    search: "নাম, ঠিকানা, এলাকা দিয়ে খুঁজুন",
    allAreas: "সব এলাকা",
    list: "তালিকা",
    map: "ম্যাপ",
    trending: "ট্রেন্ডিং",
    yes: "হ্যাঁ",
    no: "না",
    openMaps: "গুগল ম্যাপে খুলুন",
    lastReport: "সর্বশেষ রিপোর্ট",
    confidence: "নির্ভরযোগ্যতা",
    votes: "ভোট",
    mostActive: "সবচেয়ে সক্রিয়",
    topYes: "সর্বোচ্চ হ্যাঁ",
    topNo: "সর্বোচ্চ না",
  },
};

export type Dict = (typeof dict)[Lang];
