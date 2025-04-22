import { execSync } from "node:child_process";

const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	magenta: "\x1b[35m",
	blue: "\x1b[34m",
	red: "\x1b[31m",
	white: "\x1b[37m",
	gray: "\x1b[90m",
};

const elysiaOutput = execSync("bun elysia-latency.ts").toString();
const hedystiaOutput = execSync("bun hedystia-latency.ts").toString();

function extractLatencyMetrics(output: string) {
	const total = Number.parseInt(
		output.match(/Total requests: (\d+)/)?.[1] || "0",
	);
	const successful = Number.parseInt(
		output.match(/Successful requests: (\d+)/)?.[1] || "0",
	);
	const avgLatency = Number.parseFloat(
		output.match(/Average latency: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const minLatency = Number.parseFloat(
		output.match(/Min latency: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const maxLatency = Number.parseFloat(
		output.match(/Max latency: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const stdDev = Number.parseFloat(
		output.match(/Standard deviation: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const p50 = Number.parseFloat(
		output.match(/P50 latency: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const p90 = Number.parseFloat(
		output.match(/P90 latency: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const p95 = Number.parseFloat(
		output.match(/P95 latency: (\d+\.\d+) ms/)?.[1] || "0",
	);
	const p99 = Number.parseFloat(
		output.match(/P99 latency: (\d+\.\d+) ms/)?.[1] || "0",
	);

	return {
		total,
		successful,
		avgLatency,
		minLatency,
		maxLatency,
		stdDev,
		p50,
		p90,
		p95,
		p99,
	};
}

const elysia = extractLatencyMetrics(elysiaOutput);
const hedystia = extractLatencyMetrics(hedystiaOutput);

function calculateDifference(a: number, b: number) {
	const diff = b - a;
	const percent = (diff / a) * 100;
	return { diff, percent };
}

const avgLatencyComparison = calculateDifference(
	elysia.avgLatency,
	hedystia.avgLatency,
);
const p50Comparison = calculateDifference(elysia.p50, hedystia.p50);
const p90Comparison = calculateDifference(elysia.p90, hedystia.p90);
const p95Comparison = calculateDifference(elysia.p95, hedystia.p95);
const p99Comparison = calculateDifference(elysia.p99, hedystia.p99);

function colorizePercentage(value: number): string {
	if (value < 0) return `${colors.green}${value.toFixed(2)}%${colors.reset}`;
	if (value > 0) return `${colors.red}+${value.toFixed(2)}%${colors.reset}`;
	return `${value.toFixed(2)}%`;
}

console.log(
	`${colors.bright}${colors.cyan}=== Framework Latency Comparison ===${colors.reset}`,
);
console.log(
	`${colors.white}Total requests: ${colors.bright}${elysia.total}${colors.reset}\n`,
);

console.log(
	`${colors.bright}${colors.yellow}=== Average Latency ===${colors.reset}`,
);
console.log(
	`${colors.white}Elysia: ${colors.cyan}${elysia.avgLatency.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Hedystia: ${colors.cyan}${hedystia.avgLatency.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${avgLatencyComparison.diff.toFixed(2)} ms ${colorizePercentage(avgLatencyComparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.bright}${colors.yellow}=== Latency Percentiles ===${colors.reset}`,
);

console.log(
	`${colors.white}P50 (Elysia): ${colors.cyan}${elysia.p50.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}P50 (Hedystia): ${colors.cyan}${hedystia.p50.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${p50Comparison.diff.toFixed(2)} ms ${colorizePercentage(p50Comparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.white}P90 (Elysia): ${colors.cyan}${elysia.p90.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}P90 (Hedystia): ${colors.cyan}${hedystia.p90.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${p90Comparison.diff.toFixed(2)} ms ${colorizePercentage(p90Comparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.white}P95 (Elysia): ${colors.cyan}${elysia.p95.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}P95 (Hedystia): ${colors.cyan}${hedystia.p95.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${p95Comparison.diff.toFixed(2)} ms ${colorizePercentage(p95Comparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.white}P99 (Elysia): ${colors.cyan}${elysia.p99.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}P99 (Hedystia): ${colors.cyan}${hedystia.p99.toFixed(2)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${p99Comparison.diff.toFixed(2)} ms ${colorizePercentage(p99Comparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.bright}${colors.blue}=== Final Results ===${colors.reset}`,
);

if (avgLatencyComparison.percent < 0) {
	console.log(
		`${colors.white}Hedystia has ${colors.green}${Math.abs(avgLatencyComparison.percent).toFixed(2)}% lower latency ${colors.white}than Elysia${colors.reset}`,
	);
} else if (avgLatencyComparison.percent > 0) {
	console.log(
		`${colors.white}Elysia has ${colors.green}${Math.abs(avgLatencyComparison.percent).toFixed(2)}% lower latency ${colors.white}than Hedystia${colors.reset}`,
	);
} else {
	console.log(
		`${colors.white}Both frameworks have identical average latency${colors.reset}`,
	);
}

if (p95Comparison.percent < 0) {
	console.log(
		`${colors.white}Hedystia has ${colors.green}${Math.abs(p95Comparison.percent).toFixed(2)}% lower P95 latency ${colors.white}than Elysia${colors.reset}`,
	);
} else if (p95Comparison.percent > 0) {
	console.log(
		`${colors.white}Elysia has ${colors.green}${Math.abs(p95Comparison.percent).toFixed(2)}% lower P95 latency ${colors.white}than Hedystia${colors.reset}`,
	);
} else {
	console.log(
		`${colors.white}Both frameworks have identical P95 latency${colors.reset}`,
	);
}
