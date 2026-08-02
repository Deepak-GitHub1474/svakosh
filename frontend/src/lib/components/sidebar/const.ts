import BarChart from '$lib/components/svg-provider/material/BarChart.svelte';
import HealthAndSafety from '$lib/components/svg-provider/material/HealthAndSafety.svelte';
import LegendToggle from '$lib/components/svg-provider/material/LegendToggle.svelte';
import MonitorHeart from '$lib/components/svg-provider/material/MonitorHeart.svelte';
import Monitoring from '$lib/components/svg-provider/material/Monitoring.svelte';
import MultilineChart from '$lib/components/svg-provider/material/MultilineChart.svelte';
import QueryStats from '$lib/components/svg-provider/material/QueryStats.svelte';
import ScreenSearchDesktop from '$lib/components/svg-provider/material/ScreenSearchDesktop.svelte';
import Search from '$lib/components/svg-provider/material/Search.svelte';
import StackedLineChart from '$lib/components/svg-provider/material/StackedLineChart.svelte';
import TableChart from '$lib/components/svg-provider/material/TableChart.svelte';
import TableChartView from '$lib/components/svg-provider/material/TableChartView.svelte';
import TrendingUp from '$lib/components/svg-provider/material/TrendingUp.svelte';
import Visibility from '$lib/components/svg-provider/material/Visibility.svelte';
import Waves from '$lib/components/svg-provider/material/Waves.svelte';

export const menuItems = [
	{ icon: TableChartView, label: 'OI Tracker', href: '/oi/tracker' },
	{ icon: Search, label: 'Lookup', href: '/oi/lookup' },
	{ icon: Visibility, label: 'OI Glimps', href: '/oi/glimpse' },
	{ icon: TableChart, label: 'Buildup', href: '/oi/buildup' },
	{ icon: Monitoring, label: 'Call vs Put', href: '/oi/call-vs-put' },
	{ icon: MultilineChart, label: 'Multi OI', href: '/oi/multi-call-vs-put' },
	{ icon: HealthAndSafety, label: 'Max Pain', href: '/oi/max-pain' },
	{ icon: QueryStats, label: 'Straddle Analysis', href: '/charts/straddle' },
	{ icon: StackedLineChart, label: 'Strangle Analysis', href: '/charts/strangle' },
	{ icon: Waves, label: 'Air In Premiums', href: '/charts/air-in-premiums' },
	{ icon: LegendToggle, label: 'Options Chart', href: '/charts/options-chart' },
	{ icon: ScreenSearchDesktop, label: 'Stocks Screeners', href: '/stocks/stocks-screener' },
	{ icon: TrendingUp, label: '52-Week Breakout', href: '/stocks/breakout/52-week' },
	{ icon: BarChart, label: 'Volume Breakout', href: '/stocks/breakout/volume' },
	{ icon: MonitorHeart, label: 'Market Pulse', href: '/market-pulse' }
];