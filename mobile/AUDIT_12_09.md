Audit Health Score
#	Dimension	Score	Key Finding
1	Accessibility (VoiceOver/TalkBack)	1	Missing accessibility labels on most interactive elements; hard-coded font sizes defeat Dynamic Type
2	Performance	2	Hard-coded string shadows trigger layout thrash; dual charting libraries; inline filtered arrays on every render
3	Appearance & Theming	2	Platform color tokens exist but header uses #007aff; onTint is hard-coded #ffffff; Android blue/green mapped incorrectly
4	Platform Conformance	1	Web-shaped header bars; mixed icon sets (Ionicons vs SF/Material); portrait-lock; custom toggles instead of platform switches; hard-coded shadows
5	Adaptivity	1	Portrait-only; no landscape support; no keyboard/IME inset handling; touch targets consistently below 44pt/48dp
Total	 	7/20	Poor (major overhaul)
Platform Conformance Verdict
Fail. This reads as a web app ported to React Native with a thin native veneer. The navigation bars use headerTintColor and headerStyle which are web-style concepts. The header background is hard-coded blue, not semantic. The app uses Ionicons throughout instead of SF Symbols (iOS) or Material Symbols (Android). The shadow system is CSS-style strings, which React Native does not support — it's a web pattern. The header on the home screen reinvents a navigation bar instead of using native Stack headers or native tabs.
Executive Summary
- Audit Health Score: 7/20 (Poor) — major overhaul needed
- Issues found: P0: 2, P1: 8, P2: 7, P3: 4
- Top 5 critical issues:
1. Shadow system uses CSS-style strings (boxShadow) which React Native does not support — all cards render without any shadow (dead UI feature)
2. Hard-coded font sizes throughout defeat Dynamic Type / system font scaling — accessibility-breaking on both platforms
3. Touch targets consistently below 44pt (iOS) / 48dp (Android) — chip components, icon-only buttons, and action icons are undersized
4. Mixed icon system (Ionicons) instead of platform-native iconography (SF Symbols / Material Symbols)
5. Dual charting libraries loaded (react-native-gifted-charts + victory-native) — dead bundle weight
Detailed Findings by Severity
P0 Blocking
P0 Hard-coded string shadows (broken on all platforms)
- Location: src/theme/shadows.ts:1-5, used in reading-card.tsx:124, feature-card.tsx:39, stats-panel.tsx:73, new-reading.tsx:352, settings/index.tsx:253,303,353,406
- Category: Performance / Implementation Integrity
- Impact: boxShadow string values are not supported by React Native's native shadow system. Every card, section, and feature card renders with zero shadow. This is a wasted dev effort and the string values can trigger layout recalculation on JS side before being ignored by the native bridge.
- Recommendation: Use React Native's native shadow API (shadowColor, shadowOffset, shadowOpacity, elevation) or migrate to a proper shadow system.
P0 Hard-coded font sizes defeat Dynamic Type / system font scaling
- Location: src/app/(home)/index.tsx (lines 159, 456, 472, 488, 514, 530-536, 548, 554, etc.), src/app/(settings)/index.tsx (lines 232, 267, 272, 287-288, 311, 317, etc.), src/components/ui/button.tsx:74, src/components/ui/reading-card.tsx:137, src/components/ui/stats-panel.tsx:102-113, src/components/ui/chip.tsx:42, src/components/ui/badge.tsx:45-46, src/components/ui/feature-card.tsx:51,55
- Category: Accessibility
- Impact: Users who set large system font sizes will see truncated text, clipped labels, and broken layouts. On iOS this violates Human Interface Guidelines; on Android it violates accessibility requirements.
- Recommendation: Replace all hard-coded fontSize with values relative to the user's font scale setting. Use useFontScale() or similar pattern from react-native or @react-native-oss/font-scale.
P1 Major
P1 Touch targets below 44pt/48dp minimum
- Location: src/components/ui/chip.tsx:36-37 (27×12), src/components/ui/reading-card.tsx:101-108 (~44×29 icon buttons), src/components/ui/feature-card.tsx:32-40 (flex card with no min-height), src/app/(home)/index.tsx:173-187 (header buttons)
- Category: Accessibility / Platform Conformance
- Impact: Users with large fingers or motor impairments cannot reliably tap these controls. Violates iOS HIG (44×44pt) and Android accessibility guidelines (48×48dp).
- Recommendation: Set minWidth: 44, minHeight: 44 on all tappable elements. Add adequate spacing between adjacent targets.
P1 Mixed icon system (Ionicons instead of SF Symbols / Material Symbols)
- Location: src/app/(home)/index.tsx:11 (imports Ionicons), src/app/(settings)/index.tsx:13, src/components/ui/reading-card.tsx:3, src/components/ui/stats-panel.tsx:3, etc.
- Category: Platform Conformance
- Impact: iOS users see React Native default icons instead of SF Symbols; Android users see Ionicons instead of Material Symbols. Platform-native users will notice the mismatch immediately.
- Recommendation: Use @expo/vector-icons conditionally per platform: SF Symbols on iOS, Material Icons on Android. Or migrate to expo-symbols / @expo/vector-icons with platform detection.
P1 Header background hard-coded blue
- Location: src/app/(home)/_layout.tsx:16-17 and src/app/(settings)/_layout.tsx:16-17
- Category: Theming / Platform Conformance
- Impact: Header is always blue regardless of system theme, contrast mode, or brand design. Breaks Dark Mode appearance on both platforms.
- Recommendation: Use semantic system colors or derive from the theme token.
P1 Android color mapping errors
- Location: src/theme/colors.ts:40-49, 65-74
- systemBlue mapped to Color.android.dynamic.primary (should be a blue/tint role)
- systemGreen mapped to Color.android.dynamic.primary (should be green)
- systemYellow mapped to Color.android.dynamic.secondary (should be yellow)
- systemPink mapped to Color.android.dynamic.secondary (should be pink)
- systemPurple mapped to Color.android.dynamic.primary (should be purple)
- Category: Theming
- Impact: All Android secondary/accent colors resolve to the same primary color. The app looks broken on Android — blue, green, yellow, pink, and purple all map to one color.
- Recommendation: Map each color to the appropriate Android Material color role. Use Color.android.dynamic.{blue, green, yellow, pink, purple} or derive from a Material color palette.
P1 No accessibility labels on most interactive elements
- Location: src/components/ui/chip.tsx:14 (TouchableOpacity), src/components/ui/feature-card.tsx:18 (TouchableOpacity), src/components/ui/reading-card.tsx:96 (TouchableOpacity), src/app/(home)/index.tsx:173,181 (header buttons)
- Category: Accessibility
- Impact: Screen reader users cannot identify what these controls do. VoiceOver / TalkBack will announce "Button" with no descriptive label.
- Recommendation: Add accessibilityLabel to every TouchableOpacity, and accessibilityRole where applicable.
P1 Settings Switch controls lack accessibility labels
- Location: src/app/(settings)/index.tsx:122,140 (Switch components)
- Category: Accessibility
- Impact: VoiceOver/TalkBack cannot convey which reminder is toggled. The thumb color is hard-coded white.
- Recommendation: Add accessibilityLabel and accessibilityHint. Use semantic trackColor / thumbColor from theme.
P1 Portrait-only orientation
- Location: app.json:6 ("orientation": "portrait")
- Category: Adaptivity
- Impact: No support for landscape viewing, tablet use, or multitasking. Users with assistive devices may need landscape orientation.
- Recommendation: Consider "free" orientation with responsive layout support, or at least document the decision.
P1 TextInput elements lack accessibility labels
- Location: src/app/(settings)/index.tsx:181-187 (server URL input), src/app/(home)/new-reading.tsx:126-145,155-161,276-285,290-300 (all inputs)
- Category: Accessibility
- Impact: Screen reader users cannot determine what each input field is for.
- Recommendation: Add accessibilityLabel to every TextInput.
P2 Minor
P2 Dual charting libraries (dead weight)
- Location: package.json:33 (react-native-gifted-charts), package.json:39 (victory-native)
- Category: Performance
- Impact: Both libraries are installed. If only one is actively used, the other adds 50-100KB+ unnecessary bundle weight.
- Recommendation: Audit which library is actually used. Remove the unused dependency.
P2 Inline filtered/sorted arrays on every render
- Location: src/app/(home)/index.tsx:96-119 (multiple .filter() and .sort() calls)
- Category: Performance
- Impact: These arrays are recreated on every render, triggering unnecessary child re-renders. With many readings, this becomes noticeable.
- Recommendation: Wrap with useMemo().
P2 onTint is hard-coded white
- Location: src/theme/colors.ts:92 (onTint: "#ffffff")
- Category: Theming
- Impact: On dark backgrounds this works, but it ignores the system's actual on-color for the tint color. In high-contrast mode or dark theme, this should adapt.
- Recommendation: Use Color.ios.systemFillColorBright or platform equivalent.
P2 Settings uses native Switch instead of platform-standard segmented control
- Location: src/app/(settings)/index.tsx:122,140
- Category: Platform Conformance
- Impact: iOS HIG recommends Segmented Control or Toggle for binary settings. Android recommends Switch/Preference. Using the native component is acceptable, but the visual styling (custom thumb/track colors) deviates from platform defaults.
- Recommendation: Use platform-native styling or the @expo/ui toggle component for consistent platform behavior.
P2 StatsPanel chevron icon lacks accessibility role
- Location: src/components/ui/stats-panel.tsx:21-25 (Ionicons icon used as collapse toggle)
- Category: Accessibility
- Impact: Screen reader users cannot discover the expand/collapse functionality.
- Recommendation: Wrap the icon in a TouchableOpacity with accessibilityRole="button" and accessibilityLabel.
P2 No loading state for data fetching
- Location: src/app/(home)/index.tsx:57-60 (fetches happen silently)
- Category: Implementation Integrity
- Impact: Users see a blank screen while data loads. No skeleton, spinner, or placeholder.
- Recommendation: Add a loading skeleton or spinner during initial data fetch.
P2 No empty-state design
- Location: src/app/(home)/index.tsx:427 (plain "Nenhuma medição encontrada" text)
- Category: Platform Conformance
- Impact: Empty states should guide the user toward the primary action (taking a reading), not just display text.
- Recommendation: Add an illustrated empty state with a "Take your first reading" CTA.
P3 Polish
P3 Status dot too small
- Location: src/app/(home)/index.tsx:466-468 (8×8pt), src/app/(settings)/index.tsx:282-284 (8×8pt)
- Category: Accessibility
- Impact: A 8×8pt dot is barely visible. Users with low vision may miss the connection status entirely.
- Recommendation: Increase to at least 12×12pt or use a larger indicator.
P3 Feature cards have no minWidth constraint
- Location: src/components/ui/feature-card.tsx:33 (minWidth: 150)
- Category: Responsive Design
- Impact: On wider screens, feature cards could stretch excessively. On narrow screens, flexWrap: wrap causes uneven row lengths.
- Recommendation: Add maxWidth or use a grid layout.
P3 PressureCategory logic uses || instead of &&
- Location: src/components/ui/reading-card.tsx:23 (sys < 140 || dia < 90)
- Category: Implementation Integrity
- Impact: A reading of 145/95 would be classified as "Normal" by the home screen logic (sys < 140 || dia < 90 is false, so it falls to "High" — actually correct). But the logic at src/app/(home)/index.tsx:338 uses the same || pattern which means a reading of 130/85 would be classified as "Elevated" because 130 < 140 is true. This is medically inconsistent — it should be "Normal" per AHA guidelines.
- Recommendation: Use the same classification logic consistently and verify against AHA/WHO blood pressure guidelines.
P3 initialized ref in new-reading.tsx uses useRef(false) without clearing
- Location: src/app/(home)/new-reading.tsx:43
- Category: Implementation Integrity
- Impact: If the user navigates to edit a reading, goes back, then edits another, the ref persists. However, the initialized.current guard prevents re-initialization. This is intentional but could mask bugs if params change unexpectedly.
- Recommendation: Reset the ref when isEditing changes.
Patterns & Systemic Issues
1. Hard-coded shadows throughout: Every boxShadow: "0 1px 3px rgba(...)" in reading-card.tsx, feature-card.tsx, stats-panel.tsx, new-reading.tsx, and settings/index.tsx is dead code. React Native requires native shadow properties. This affects 8+ files.
2. Hard-coded font sizes across all screens and components: Every screen and component uses fixed fontSize values (11-52pt) with no font scale awareness. This is a systemic accessibility violation across the entire app.
3. Touch targets below platform minimum: Chip components (27×12), icon buttons (~44×29), and header buttons are consistently undersized. This pattern appears in at least 12 locations across 6 components.
4. Android color mapping is broken: 5+ color tokens in colors.ts map Android values to the same primary role, rendering all accent colors as one color on Android.
5. Mixed icon system: Ionicons is used throughout instead of platform-native iconography. This pattern affects every screen and most components (15+ files).
Positive Findings
1. Excellent platform color foundation: The src/theme/colors.ts file correctly uses Color.ios.* and Color.android.dynamic.* for semantic colors (label, secondaryLabel, systemBackground, etc.). This is the right approach for cross-platform theming.
2. Dark mode support: src/app/_layout.tsx:21 correctly wraps content in ThemeProvider with useColorScheme(). Both light and dark appearances are supported at the root level.
3. Safe area handling: All screens correctly use SafeAreaView with useSafeAreaInsets() from react-native-safe-area-context. Content is laid out inside safe area insets.
4. Expo Router native tabs: src/app/_layout.tsx:1-36 uses NativeTabs with SF Symbols on iOS and Material icons on Android. This is the correct platform-adaptive navigation pattern.
5. Pull-to-refresh implemented: src/app/(home)/index.tsx:147-153 uses RefreshControl with onRefresh for data sync.
6. Modal presentation for form: src/app/(home)/new-reading.tsx uses presentation: 'modal' (line 64 in _layout.tsx), which is the correct pattern for a focused task.
7. Local-first architecture: The store (useAppStore.js) correctly implements offline-first with SQLite persistence and background sync — good for a health app where connectivity may be intermittent.
8. Design token system exists: Well-organized theme files for colors, spacing, typography, radius, shadows, and motion. The structure is clean and maintainable.
Recommended Actions
 1. P0 /impeccable harden [target]: Fix hard-coded string shadows. Replace boxShadow strings with React Native native shadow properties (shadowColor, shadowOffset, shadowOpacity, elevation) or remove shadows entirely if not needed.
 2. P0 /impeccable harden [target]: Fix hard-coded font sizes. Replace all fixed fontSize values with font scale-aware sizing to support Dynamic Type (iOS) and system font scaling (Android).
 3. P1 /impeccable layout [target]: Fix touch targets. Ensure all tappable elements are at least 44×44pt (iOS) / 48×48dp (Android) with adequate spacing between adjacent targets.
 4. P1 /impeccable colorize [target]: Fix Android color mappings. Map each semantic color (systemBlue, systemGreen, systemOrange, systemYellow, systemPink, systemPurple) to the correct Android Material color role.
 5. P1 /impeccable harden [target]: Add accessibility labels to all interactive elements (chips, buttons, feature cards, switches, text inputs, stat panel toggle).
 6. P1 /impeccable adapt [target]: Fix icon system. Replace Ionicons with SF Symbols on iOS and Material Symbols on Android using @expo/vector-icons with platform detection.
 7. P1 /impeccable adapt [target]: Fix header background. Remove hard-coded #007aff and use semantic colors that adapt to light/dark theme.
 8. P2 /impeccable optimize [target]: Remove dead charting library dependency. Audit which of react-native-gifted-charts vs victory-native is actually used and remove the other.
 9. P2 /impeccable optimize [target]: Memoize filtered/sorted arrays in home screen with useMemo().
10. P2 /impeccable animate [target]: Add loading states and empty-state design to home screen.
11. P2 /impeccable clarify [target]: Fix blood pressure classification logic. Ensure consistency between reading-card.tsx and index.tsx and verify against AHA/WHO guidelines.
12. P3 Final step: /impeccable polish [target]: After fixes, run polish pass for final quality check.