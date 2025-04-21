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

const elysiaOutput = execSync("bun elysia.ts").toString();
const hedystiaOutput = execSync("bun hedystia.ts").toString();

function extractMetrics(output: string) {
	const routes = Number.parseInt(output.match(/(\d+) routes took/)?.[1] || "0");
	const totalTime = Number.parseFloat(
		output.match(/took (\d+\.\d+) ms/)?.[1] || "0",
	);
	const avgTime = Number.parseFloat(
		output.match(/Average (\d+\.\d+) ms/)?.[1] || "0",
	);
	const memory = Number.parseFloat(
		output.match(/(\d+\.\d+) MB memory/)?.[1] || "0",
	);

	return { routes, totalTime, avgTime, memory };
}

const elysia = extractMetrics(elysiaOutput);
const hedystia = extractMetrics(hedystiaOutput);

function calculateDifference(a: number, b: number) {
	const diff = b - a;
	const percent = (diff / a) * 100;
	return { diff, percent };
}

const totalTimeComparison = calculateDifference(
	elysia.totalTime,
	hedystia.totalTime,
);
const avgTimeComparison = calculateDifference(elysia.avgTime, hedystia.avgTime);
const memoryComparison = calculateDifference(elysia.memory, hedystia.memory);

function colorizePercentage(value: number): string {
	if (value < 0) return `${colors.green}${value.toFixed(2)}%${colors.reset}`;
	if (value > 0) return `${colors.red}+${value.toFixed(2)}%${colors.reset}`;
	return `${value.toFixed(2)}%`;
}

console.log(
	`${colors.bright}${colors.cyan}=== Framework Comparison ===${colors.reset}`,
);
console.log(
	`${colors.white}Total routes: ${colors.bright}${elysia.routes}${colors.reset}\n`,
);

console.log(
	`${colors.bright}${colors.yellow}=== Total Time ===${colors.reset}`,
);
console.log(
	`${colors.white}Elysia: ${colors.cyan}${elysia.totalTime.toFixed(4)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Hedystia: ${colors.cyan}${hedystia.totalTime.toFixed(4)} ms${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${totalTimeComparison.diff.toFixed(4)} ms ${colorizePercentage(totalTimeComparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.bright}${colors.yellow}=== Average Time per Route ===${colors.reset}`,
);
console.log(
	`${colors.white}Elysia: ${colors.cyan}${elysia.avgTime.toFixed(4)} ms/route${colors.reset}`,
);
console.log(
	`${colors.white}Hedystia: ${colors.cyan}${hedystia.avgTime.toFixed(4)} ms/route${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${avgTimeComparison.diff.toFixed(4)} ms ${colorizePercentage(avgTimeComparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.bright}${colors.yellow}=== Memory Usage ===${colors.reset}`,
);
console.log(
	`${colors.white}Elysia: ${colors.cyan}${elysia.memory.toFixed(2)} MB${colors.reset}`,
);
console.log(
	`${colors.white}Hedystia: ${colors.cyan}${hedystia.memory.toFixed(2)} MB${colors.reset}`,
);
console.log(
	`${colors.white}Difference: ${colors.magenta}${memoryComparison.diff.toFixed(2)} MB ${colorizePercentage(memoryComparison.percent)}${colors.reset}`,
);

console.log(
	`\n${colors.bright}${colors.blue}=== Final Results ===${colors.reset}`,
);
if (totalTimeComparison.percent < 0) {
	console.log(
		`${colors.white}Hedystia is ${colors.green}${Math.abs(totalTimeComparison.percent).toFixed(2)}% faster ${colors.white}than Elysia${colors.reset}`,
	);
} else {
	console.log(
		`${colors.white}Elysia is ${colors.red}${totalTimeComparison.percent.toFixed(2)}% faster ${colors.white}than Hedystia${colors.reset}`,
	);
}

if (memoryComparison.percent < 0) {
	console.log(
		`${colors.white}Hedystia uses ${colors.green}${Math.abs(memoryComparison.percent).toFixed(2)}% less memory ${colors.white}than Elysia${colors.reset}`,
	);
} else {
	console.log(
		`${colors.white}Elysia uses ${colors.red}${memoryComparison.percent.toFixed(2)}% less memory ${colors.white}than Hedystia${colors.reset}`,
	);
}
