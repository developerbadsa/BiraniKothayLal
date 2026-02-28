const required = ["MONGODB_URI", "VOTER_HASH_SALT", "NEXT_PUBLIC_APP_URL"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
});

export const env = {
  MONGODB_URI: process.env.MONGODB_URI!,
  VOTER_HASH_SALT: process.env.VOTER_HASH_SALT!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  NEXT_PUBLIC_DEFAULT_DISTRICT: process.env.NEXT_PUBLIC_DEFAULT_DISTRICT ?? "Lalmonirhat",
};
