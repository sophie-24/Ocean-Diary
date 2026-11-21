import Svg, { Path } from "react-native-svg";

/** Kakao speech-bubble symbol (dark on the yellow Kakao button). */
export function KakaoLogo({ size = 20, color = "#191919" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path
        fill={color}
        d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.65 6.6-.2.74-.74 2.67-.85 3.08-.13.51.19.5.4.37.17-.11 2.64-1.79 3.71-2.52.68.1 1.38.15 2.09.15 5.52 0 10-3.58 10-7.68S17.52 3 12 3z"
      />
    </Svg>
  );
}

/** Google "G" in its four brand colors (for the white Google button). */
export function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.7-3.78H1.34v3.09A12 12 0 0 0 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.36 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.34a12 12 0 0 0 0 10.8l4.02-3.09z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.34 6.6l4.02 3.09A7.2 7.2 0 0 1 12 4.75z"
      />
    </Svg>
  );
}
