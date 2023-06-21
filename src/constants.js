export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://long-dawn-7576.fly.dev"
    : "http://localhost:3000";
