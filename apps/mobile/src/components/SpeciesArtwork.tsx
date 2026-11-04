import type { StyleProp, ViewStyle } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

type Props = { slug: string; style?: StyleProp<ViewStyle> };
type FishPalette = {
  water: string;
  waterLight: string;
  body: string;
  shade: string;
  fin: string;
  accent: string;
  outline: string;
};

const palettes: Record<string, FishPalette> = {
  "jari-dom": { water: "#DDEBE2", waterLight: "#F5E8CF", body: "#547D79", shade: "#315B5B", fin: "#769B91", accent: "#E9C98F", outline: "#294A4D" },
  "jwi-noraemi": { water: "#E5E8D8", waterLight: "#F4E7CE", body: "#A08C5E", shade: "#6D664B", fin: "#B5A16D", accent: "#E6D39D", outline: "#5B5742" },
  "dol-dom": { water: "#DDE9E7", waterLight: "#F1E6D0", body: "#D9D2B9", shade: "#536665", fin: "#B7B39D", accent: "#F4E9C8", outline: "#42575A" },
  "bol-rak": { water: "#E6E2D5", waterLight: "#F3E5D0", body: "#9E775E", shade: "#664F48", fin: "#B18769", accent: "#E6C792", outline: "#564540" },
  "jopi-bol-rak": { water: "#DCE6E1", waterLight: "#F1E3CE", body: "#737A72", shade: "#484E4B", fin: "#90958A", accent: "#D8C7A0", outline: "#414947" },
  "gamseong-dom": { water: "#DCE7E4", waterLight: "#F2E6D2", body: "#596965", shade: "#394846", fin: "#78837A", accent: "#D6C6A4", outline: "#354442" },
};

const bodyShapes: Record<string, string> = {
  "jari-dom": "M76 101 C94 61 150 51 207 68 C229 75 244 89 250 101 C238 120 215 135 184 141 C132 151 91 132 76 101 Z",
  "jwi-noraemi": "M69 105 C92 76 143 68 210 79 C231 83 247 93 256 104 C240 124 208 134 160 137 C111 139 82 126 69 105 Z",
  "dol-dom": "M75 102 C93 61 146 54 207 70 C230 76 246 89 254 102 C245 121 220 136 183 142 C129 151 91 132 75 102 Z",
  "bol-rak": "M83 105 C98 68 149 59 205 76 C229 83 245 94 251 105 C239 125 214 139 177 143 C130 147 96 132 83 105 Z",
  "jopi-bol-rak": "M68 105 C84 73 131 62 190 73 C219 78 244 91 256 105 C244 126 220 139 181 143 C127 149 88 133 68 105 Z",
  "gamseong-dom": "M73 103 C90 65 139 48 195 61 C225 68 246 85 257 103 C247 124 222 140 185 146 C132 154 91 134 73 103 Z",
};

export function SpeciesArtwork({ slug, style }: Props) {
  if (slug === "cham-muneo") {
    return (
      <Svg accessible={false} viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice" style={style}>
        <Defs>
          <LinearGradient id="storybookOctopusWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#DCE7E1" />
            <Stop offset="100%" stopColor="#E9D8C2" />
          </LinearGradient>
          <LinearGradient id="storybookOctopusMantle" x1="0%" y1="0%" x2="70%" y2="100%">
            <Stop offset="0%" stopColor="#B98562" />
            <Stop offset="100%" stopColor="#795846" />
          </LinearGradient>
        </Defs>
        <Rect width="320" height="190" fill="url(#storybookOctopusWater)" />
        <Circle cx="265" cy="34" r="22" fill="#FFF5D9" opacity="0.58" />
        <Path d="M0 150 C59 137 95 163 153 150 C217 136 269 158 320 145 L320 190 L0 190 Z" fill="#B9B29C" opacity="0.62" />
        <Path d="M20 190 C23 166 17 158 26 144 M39 190 C39 170 49 160 52 149 M299 190 C291 168 296 158 287 145 M278 190 C276 171 267 162 264 151" fill="none" stroke="#738D7E" strokeWidth="6" strokeLinecap="round" opacity="0.82" />
        <Path d="M128 119 C104 130 92 151 75 160 C62 168 52 162 58 153 C74 138 88 126 99 111 M137 126 C122 146 113 163 96 173 C82 181 75 173 84 164 C98 149 108 135 117 119 M148 130 C143 150 143 168 132 180 C122 192 111 184 118 173 C127 157 129 141 130 123 M160 130 C165 151 173 164 166 177 C159 189 148 185 151 174 C156 158 150 142 145 126 M174 127 C189 143 202 153 202 168 C202 181 191 183 187 171 C182 155 169 143 158 123 M184 120 C207 130 224 137 231 151 C237 163 227 169 219 158 C208 143 191 137 169 119 M190 111 C214 116 237 120 250 132 C261 142 252 150 241 142 C224 129 205 127 176 112 M190 102 C214 102 237 99 253 108 C266 115 261 125 247 120 C227 112 207 116 179 105" fill="none" stroke="#805B48" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M128 119 C104 130 92 151 75 160 C62 168 52 162 58 153 C74 138 88 126 99 111 M137 126 C122 146 113 163 96 173 C82 181 75 173 84 164 C98 149 108 135 117 119 M148 130 C143 150 143 168 132 180 C122 192 111 184 118 173 C127 157 129 141 130 123 M160 130 C165 151 173 164 166 177 C159 189 148 185 151 174 C156 158 150 142 145 126 M174 127 C189 143 202 153 202 168 C202 181 191 183 187 171 C182 155 169 143 158 123 M184 120 C207 130 224 137 231 151 C237 163 227 169 219 158 C208 143 191 137 169 119 M190 111 C214 116 237 120 250 132 C261 142 252 150 241 142 C224 129 205 127 176 112 M190 102 C214 102 237 99 253 108 C266 115 261 125 247 120 C227 112 207 116 179 105" fill="none" stroke="#D0A27B" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <Path d="M111 100 C106 82 115 61 139 54 C160 47 184 57 190 78 C196 97 185 116 166 124 C148 132 125 121 111 100 Z" fill="url(#storybookOctopusMantle)" stroke="#684A3D" strokeWidth="4" />
        <Path d="M119 82 C125 72 133 66 144 64 M176 67 C184 76 185 85 182 92" fill="none" stroke="#E3B78A" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        <Circle cx="123" cy="87" r="3" fill="#E4C08B" opacity="0.8" />
        <Circle cx="170" cy="99" r="3.5" fill="#D4A46E" opacity="0.9" />
        <Circle cx="151" cy="75" r="2.5" fill="#E8C991" opacity="0.85" />
        <Circle cx="150" cy="111" r="3" fill="#6E8C87" opacity="0.85" />
        <Path d="M121 114 C126 106 134 103 142 105 M168 108 C176 105 183 101 187 94" fill="none" stroke="#75513F" strokeWidth="5" strokeLinecap="round" />
        <Circle cx="132" cy="111" r="5.5" fill="#FFF0D2" stroke="#65483B" strokeWidth="2" />
        <Circle cx="133" cy="111" r="2.7" fill="#263D42" />
        <Circle cx="175" cy="105" r="5.5" fill="#FFF0D2" stroke="#65483B" strokeWidth="2" />
        <Circle cx="176" cy="105" r="2.7" fill="#263D42" />
        {[0, 1, 2, 3, 4].map((i) => <Circle key={`left-sucker-${i}`} cx={75 + i * 6} cy={157 - i * 8} r="1.8" fill="#F1D8B2" />)}
        {[0, 1, 2, 3, 4].map((i) => <Circle key={`right-sucker-${i}`} cx={196 + i * 9} cy={164 - i * 8} r="1.8" fill="#F1D8B2" />)}
        <Circle cx="71" cy="54" r="3" fill="#FFFFFF" opacity="0.7" />
        <Circle cx="82" cy="42" r="2" fill="#FFFFFF" opacity="0.65" />
      </Svg>
    );
  }
  const colors = palettes[slug];
  const body = bodyShapes[slug];
  if (!colors || !body) {
    return (
      <Svg accessible={false} viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice" style={style}>
        <Defs>
          <LinearGradient id="storybookWaterPlaceholder" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#DDEBE2" />
            <Stop offset="100%" stopColor="#F5E8CF" />
          </LinearGradient>
        </Defs>
        <Rect width="320" height="190" fill="url(#storybookWaterPlaceholder)" />
        <Circle cx="262" cy="36" r="20" fill="#FFF8E7" opacity="0.55" />
        <Circle cx="262" cy="36" r="12" fill="#FFFDF4" opacity="0.72" />
        <Circle cx="58" cy="57" r="5" fill="#FFFFFF" opacity="0.55" />
        <Circle cx="74" cy="40" r="3" fill="#FFFFFF" opacity="0.5" />
        <Circle cx="286" cy="80" r="4" fill="#FFFFFF" opacity="0.58" />
        <Path d="M0 157 C52 145 98 165 146 154 C207 141 256 161 320 148 L320 190 L0 190 Z" fill="#D5D0B7" opacity="0.58" />
        <Path d="M22 190 C26 166 15 159 24 143 M35 190 C42 170 37 158 48 150 M299 190 C290 170 302 161 293 145 M281 190 C277 171 282 161 268 154" fill="none" stroke="#719087" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <SvgText x="160" y="126" fill="#536C63" fontSize="15" fontWeight="600" textAnchor="middle">그림 준비 중</SvgText>
      </Svg>
    );
  }
  const isBream = slug === "dol-dom";
  const isRockfish = slug === "bol-rak" || slug === "jopi-bol-rak";
  const isGreenling = slug === "jwi-noraemi";
  const isDamsel = slug === "jari-dom";
  const isGamseongDom = slug === "gamseong-dom";

  return (
    <Svg accessible={false} viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice" style={style}>
      <Defs>
        <LinearGradient id="storybookWater" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.water} />
          <Stop offset="100%" stopColor={colors.waterLight} />
        </LinearGradient>
        <ClipPath id="fishBodyClip"><Path d={body} /></ClipPath>
      </Defs>
      <Rect width="320" height="190" fill="url(#storybookWater)" />
      <Circle cx="262" cy="36" r="20" fill="#FFF8E7" opacity="0.55" />
      <Circle cx="262" cy="36" r="12" fill="#FFFDF4" opacity="0.72" />
      <Circle cx="45" cy="49" r="5" fill="#FFFFFF" opacity="0.55" />
      <Circle cx="57" cy="33" r="3" fill="#FFFFFF" opacity="0.5" />
      <Circle cx="286" cy="80" r="4" fill="#FFFFFF" opacity="0.58" />
      <Circle cx="274" cy="96" r="2.5" fill="#FFFFFF" opacity="0.55" />
      <Path d="M0 157 C52 145 98 165 146 154 C207 141 256 161 320 148 L320 190 L0 190 Z" fill="#D5D0B7" opacity="0.58" />
      <Path d="M22 190 C26 166 15 159 24 143 M28 190 C42 170 37 158 48 150 M299 190 C290 170 302 161 293 145 M289 190 C277 171 282 161 268 154" fill="none" stroke="#719087" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
      <Path d="M18 174 C30 168 38 168 48 173 M284 174 C273 167 265 168 256 174" fill="none" stroke="#91A88D" strokeWidth="4" strokeLinecap="round" />
      <Path d="M46 122 C39 104 41 91 34 78 M48 118 C57 103 61 94 61 83 M274 119 C266 103 265 94 268 81" fill="none" stroke="#91A88D" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      <Path d="M81 101 C59 82 40 78 27 81 C39 95 39 109 27 124 C47 124 64 117 81 108 Z" fill={colors.fin} stroke={colors.outline} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M120 75 C137 56 158 53 179 61 C168 71 154 78 141 82 Z" fill={colors.fin} stroke={colors.outline} strokeWidth="3" strokeLinejoin="round" />
      {isGamseongDom && <Path d="M124 69 L129 53 M137 65 L143 48 M151 62 L157 45 M165 61 L171 45 M179 63 L185 48 M193 67 L199 54" stroke={colors.outline} strokeWidth="2.5" strokeLinecap="round" />}
      <Path d="M131 135 C145 149 162 151 177 144 C166 138 153 134 141 130 Z" fill={colors.fin} stroke={colors.outline} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M177 133 C194 145 208 146 218 141 C209 134 202 127 197 121 Z" fill={colors.fin} stroke={colors.outline} strokeWidth="3" strokeLinejoin="round" />
      <Path d={body} fill={colors.body} stroke={colors.outline} strokeWidth="4" strokeLinejoin="round" />

      <G clipPath="url(#fishBodyClip)">
        {isBream && <>
          <Path d="M112 59 C104 83 104 117 113 145 M139 55 C131 82 132 119 141 148 M167 57 C158 84 160 119 169 147 M195 63 C187 86 188 116 196 140 M220 74 C214 93 215 112 222 130" fill="none" stroke={colors.shade} strokeWidth="9" opacity="0.82" />
        </>}
        {isGreenling && <>
          <Path d="M85 94 C129 82 177 82 231 96 M82 101 C130 91 183 92 240 105 M84 108 C134 101 183 102 239 113 M91 116 C135 111 183 111 229 121 M102 124 C143 121 184 120 214 128" fill="none" stroke={colors.accent} strokeWidth="2.2" opacity="0.68" />
        </>}
        {isRockfish && <>
          <Circle cx="117" cy="91" r="3" fill={colors.accent} opacity="0.72" />
          <Circle cx="136" cy="119" r="3.5" fill={colors.shade} opacity="0.52" />
          <Circle cx="162" cy="84" r="2.8" fill={colors.accent} opacity="0.7" />
          <Circle cx="181" cy="116" r="3.2" fill={colors.shade} opacity="0.5" />
          <Circle cx="202" cy="91" r="2.6" fill={colors.accent} opacity="0.7" />
          <Circle cx="217" cy="109" r="2.8" fill={colors.shade} opacity="0.48" />
          <Path d="M220 82 L226 88 M224 78 L230 85 M216 77 L223 84" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" opacity="0.72" />
        </>}
        {isDamsel && <>
          <Path d="M111 76 C133 67 188 70 218 86 M105 121 C137 134 190 132 222 116" fill="none" stroke={colors.accent} strokeWidth="2.2" opacity="0.72" />
          <Circle cx="133" cy="91" r="2.2" fill="#EAD5A5" opacity="0.8" />
          <Circle cx="160" cy="119" r="2" fill="#EAD5A5" opacity="0.75" />
          <Circle cx="190" cy="91" r="2.3" fill="#EAD5A5" opacity="0.8" />
        </>}
        {isGamseongDom && <>
          <Path d="M92 122 C128 141 183 142 222 122" fill="none" stroke="#D8D3C1" strokeWidth="7" opacity="0.62" />
          <Path d="M115 72 C142 59 186 62 215 78" fill="none" stroke="#AEB9AD" strokeWidth="3" opacity="0.5" />
          <Circle cx="145" cy="92" r="2" fill={colors.accent} opacity="0.55" />
          <Circle cx="179" cy="117" r="2.2" fill={colors.accent} opacity="0.5" />
        </>}
      </G>

      <Path d="M157 95 C171 100 172 111 157 118 C169 120 178 116 182 108 C178 99 169 95 157 95 Z" fill={colors.shade} opacity="0.55" />
      <Path d="M127 81 C130 89 130 113 126 123" fill="none" stroke={colors.outline} strokeWidth="2.3" opacity="0.65" />
      <Circle cx="103" cy="91" r="8" fill="#FFF5D9" stroke={colors.outline} strokeWidth="2.5" />
      <Circle cx="105" cy="91" r="4.2" fill="#263D42" />
      <Circle cx="106.5" cy="89.5" r="1.3" fill="#FFFFFF" />
      <Path d="M78 103 Q72 106 77 110" fill="none" stroke={colors.outline} strokeWidth="2.4" strokeLinecap="round" />
      {isRockfish && <Path d="M92 103 L88 111 M94 105 L91 114 M96 106 L94 115" stroke={colors.outline} strokeWidth="1.6" strokeLinecap="round" />}
      <Path d="M147 61 C161 57 174 59 185 65" fill="none" stroke="#FFF5D9" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
      <Circle cx="244" cy="52" r="3" fill="#FFFFFF" opacity="0.7" />
      <Circle cx="252" cy="62" r="2" fill="#FFFFFF" opacity="0.7" />
    </Svg>
  );
}
