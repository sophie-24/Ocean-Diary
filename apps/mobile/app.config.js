const { isIP } = require("node:net");

const easBuildProfile = process.env.EAS_BUILD_PROFILE;
const configuredBuildTarget = process.env.OCEAN_DIARY_BUILD_TARGET;
const buildTarget = easBuildProfile || configuredBuildTarget;
const isDistributionBuild = ["preview", "production"].includes(buildTarget);

function isPublicHttpsOrigin(rawValue) {
  let url;
  try {
    url = new URL(rawValue);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  const ipVersion = isIP(hostname);
  const ipv4Octets = ipVersion === 4 ? hostname.split(".").map(Number) : [];
  const [firstOctet, secondOctet] = ipv4Octets;
  const isPrivateIpv4 = ipVersion === 4 && (
    firstOctet === 0
    || firstOctet === 10
    || firstOctet === 127
    || (firstOctet === 169 && secondOctet === 254)
    || (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31)
    || (firstOctet === 192 && secondOctet === 168)
    || (firstOctet === 100 && secondOctet >= 64 && secondOctet <= 127)
    || firstOctet >= 224
  );
  const isPrivateIpv6 = ipVersion === 6 && (
    hostname === "::"
    || hostname === "::1"
    || /^(fc|fd|fe[89ab])/.test(hostname)
    || hostname.includes("ffff:")
    || hostname.startsWith("ff")
  );
  const isLoopbackOrPrivateHost =
    hostname === "localhost"
    || hostname.endsWith(".localhost")
    || hostname === "0.0.0.0"
    || isPrivateIpv4
    || isPrivateIpv6;
  const isPlaceholderOrLocalDomain =
    !hostname.includes(".")
    || [".local", ".lan", ".internal", ".test", ".example", ".invalid"].some((suffix) =>
      hostname.endsWith(suffix),
    );

  return url.protocol === "https:"
    && !isLoopbackOrPrivateHost
    && !isPlaceholderOrLocalDomain
    && url.pathname === "/"
    && url.search === ""
    && url.hash === ""
    && url.username === ""
    && url.password === "";
}

function isSupabasePublishableKey(key) {
  if (key.startsWith("sb_publishable_")) return true;
  const segments = key.split(".");
  if (segments.length !== 3) return false;
  try {
    const claims = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8"));
    return claims.role === "anon";
  } catch {
    return false;
  }
}

if (
  easBuildProfile
  && configuredBuildTarget
  && easBuildProfile !== configuredBuildTarget
  && (isDistributionBuild || ["preview", "production"].includes(configuredBuildTarget))
) {
  throw new Error(
    `OCEAN_DIARY_BUILD_TARGET (${configuredBuildTarget}) must match EAS_BUILD_PROFILE (${easBuildProfile}).`,
  );
}

if (isDistributionBuild) {
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!isPublicHttpsOrigin(rawApiUrl)) {
    throw new Error(
      `The ${buildTarget} build requires a public HTTPS API origin in EXPO_PUBLIC_API_URL; local/private hosts, paths, query strings, fragments, and credentials are not allowed.`,
    );
  }

  const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!isPublicHttpsOrigin(rawSupabaseUrl)) {
    throw new Error(
      `The ${buildTarget} build requires a public HTTPS Supabase project origin in EXPO_PUBLIC_SUPABASE_URL.`,
    );
  }
  if (!supabasePublishableKey || !isSupabasePublishableKey(supabasePublishableKey)) {
    throw new Error(
      `The ${buildTarget} build requires a Supabase publishable key or legacy anon key in EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY; secret and service-role keys are not allowed.`,
    );
  }
  if (process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN?.trim()) {
    throw new Error(
      `EXPO_PUBLIC_DEV_AUTH_TOKEN must be unset for ${buildTarget} builds.`,
    );
  }
}

module.exports = ({ config }) => {
  const plugins = config.plugins ?? [];
  const hasSecureStorePlugin = plugins.some((plugin) =>
    (Array.isArray(plugin) ? plugin[0] : plugin) === "expo-secure-store",
  );

  return {
    ...config,
    plugins: hasSecureStorePlugin ? plugins : [...plugins, "expo-secure-store"],
  };
};
