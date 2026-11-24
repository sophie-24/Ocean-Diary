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
  // 관리자 화면의 종 이미지 업로드(최대 4MB)를 서버 액션으로 받기 위해 한도를 올린다.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
