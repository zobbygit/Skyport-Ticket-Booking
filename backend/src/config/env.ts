import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  databaseUrl: process.env.DATABASE_URL || "",

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  cookieSecret: process.env.COOKIE_SECRET || "",

  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || "",
    password: process.env.SUPER_ADMIN_PASSWORD || "",
    name: process.env.SUPER_ADMIN_NAME || "SkyPort Super Admin",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },


// email: {
//   host: process.env.BREVO_SMTP_HOST || "",
//   port: parseInt(process.env.BREVO_SMTP_PORT || "587", 10),
//   user: process.env.BREVO_SMTP_USER || "",
//   password: process.env.BREVO_SMTP_PASSWORD || "",
//   fromEmail: process.env.BREVO_FROM_EMAIL || "",
//   fromName: process.env.BREVO_FROM_NAME || "SkyPort",
// },

email: {
  apiKey: process.env.BREVO_API_KEY || "",
  fromEmail: process.env.BREVO_FROM_EMAIL || "",
  fromName: process.env.BREVO_FROM_NAME || "SkyPort",
},

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "300", 10),
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    currency: process.env.STRIPE_CURRENCY || "usd",
  },
};

if (!env.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn("[env] DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}