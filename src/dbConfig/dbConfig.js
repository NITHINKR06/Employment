export async function connect() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    // Gracefully fallback when no database URI is defined
    return { connected: false, mode: "mock" };
  }
  return { connected: true, mode: "mongodb" };
}
