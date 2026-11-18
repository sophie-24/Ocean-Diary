/**
 * Minimal Next.js config for today.mola.app.
 *
 * - React strict mode on: catches effect/subscribe leaks before Vercel does.
 * - No custom webpack: everything we ship here is server/client components, no
 *   native bindings. If we later add the `expo-audio` style ambient mix, it
 *   stays web-audio-only.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
