export { MobileLayout } from './layout/mobile-layout';
export type { MobileLayoutProps } from './layout/mobile-layout';
export { LayoutRouter } from './layout/layout-router';
export type { LayoutRouterProps } from './layout/layout-router';
export { MobileHeader } from './navigation/mobile-header';
export type { MobileHeaderProps } from './navigation/mobile-header';
export { BottomNavigation } from './navigation/bottom-nav';
export { HeroCard } from './cards/hero-card';
export type { HeroCardProps } from './cards/hero-card';
export { InsightCard } from './cards/insight-card';
export type { InsightCardProps, InsightSeverity } from './cards/insight-card';
export { ActionCard } from './cards/action-card';
export type { ActionCardProps } from './cards/action-card';
export { ProgressCard } from './cards/progress-card';
export type { ProgressCardProps, ProgressStatus } from './cards/progress-card';
export { MetricDualCard } from './cards/metric-dual-card';
export type { MetricDualCardProps } from './cards/metric-dual-card';
export { ListItemCard } from './cards/list-item-card';
export type { ListItemCardProps } from './cards/list-item-card';
export { SearchBar } from './cards/search-bar';
export type { SearchBarProps } from './cards/search-bar';
export { ChipFilter } from './cards/chip-filter';
export type { ChipFilterProps } from './cards/chip-filter';
export { CurrencyInput } from './cards/currency-input';
export type { CurrencyInputProps } from './cards/currency-input';
export { Sparkline } from './cards/sparkline';
export type { SparklineProps } from './cards/sparkline';
export { DonutChart } from './cards/donut-chart';
export type { DonutChartProps, DonutSegment } from './cards/donut-chart';
export { BottomSheet } from './sheets/bottom-sheet';
export type { BottomSheetProps, BottomSheetMaxHeight } from './sheets/bottom-sheet';
export { FAB } from './controls/fab';
export type { FABProps } from './controls/fab';

// ─── hooks ─────────────────────────────────────────────────────────────

export { useViewport } from '@/hooks/mobile/use-viewport';
export type { ViewportState } from '@/hooks/mobile/use-viewport';

export { useOrientation } from '@/hooks/mobile/use-orientation';
export type { OrientationState } from '@/hooks/mobile/use-orientation';

export { useVirtualKeyboard } from '@/hooks/mobile/use-virtual-keyboard';
export type { VirtualKeyboardState } from '@/hooks/mobile/use-virtual-keyboard';

export { useSafeArea } from '@/hooks/mobile/use-safe-area';
export type { SafeAreaState } from '@/hooks/mobile/use-safe-area';

export { useBreakpoint } from '@/hooks/mobile/use-breakpoint';
export type { Breakpoint } from '@/hooks/mobile/use-breakpoint';

export { useMediaQuery } from '@/hooks/mobile/use-media-query';

export { useReducedMotion } from '@/hooks/mobile/use-reduced-motion';

export { usePageHeader } from '@/hooks/mobile/use-page-header';
export type { PageHeaderConfig } from '@/hooks/mobile/use-page-header';

// ─── provider ──────────────────────────────────────────────────────────

export { MobileProvider, useMobileContext } from '@/providers/mobile-provider';
export type { MobileContextValue } from '@/providers/mobile-provider';
