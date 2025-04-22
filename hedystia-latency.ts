import Framework, { h } from "hedystia";

const app = new Framework();
const plugin = new Framework();

const total = 500000;

const responseSchema = { response: h.string() };

plugin.static("/test", new Response("hello world"), responseSchema);
app.use(plugin);

app.listen(3000);

async function measureLatency() {
	const latencies = [];
	const errors = [];

	console.log(`Making ${total} requests!`);

	for (let i = 0; i < total; i++) {
		const start = performance.now();
		try {
			const response = await fetch("http://localhost:3000/test");
			if (!response.ok) {
				errors.push(i);
			}
		} catch (err) {
			errors.push(i);
		} finally {
			const end = performance.now();
			latencies.push(end - start);
		}
	}

	const totalLatency = latencies.reduce((sum, val) => sum + val, 0);
	const avgLatency = totalLatency / latencies.length;
	const minLatency = Math.min(...latencies);
	const maxLatency = Math.max(...latencies);

	const variance =
		latencies.reduce((sum, val) => sum + (val - avgLatency) ** 2, 0) /
		latencies.length;
	const stdDev = Math.sqrt(variance);

	const sortedLatencies = [...latencies].sort((a, b) => a - b);
	const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)];
	const p90 = sortedLatencies[Math.floor(sortedLatencies.length * 0.9)];
	const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
	const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];

	console.log(`Total requests: ${total}`);
	console.log(`Successful requests: ${total - errors.length}`);
	console.log(`Failed requests: ${errors.length}`);
	console.log(`Total latency: ${totalLatency.toFixed(2)} ms`);
	console.log(`Average latency: ${avgLatency.toFixed(2)} ms`);
	console.log(`Min latency: ${minLatency.toFixed(2)} ms`);
	console.log(`Max latency: ${maxLatency.toFixed(2)} ms`);
	console.log(`Standard deviation: ${stdDev.toFixed(2)} ms`);
	console.log(`P50 latency: ${p50?.toFixed(2)} ms`);
	console.log(`P90 latency: ${p90?.toFixed(2)} ms`);
	console.log(`P95 latency: ${p95?.toFixed(2)} ms`);
	console.log(`P99 latency: ${p99?.toFixed(2)} ms`);

	app.close();

	return {
		total,
		successful: total - errors.length,
		failed: errors.length,
		totalLatency,
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

measureLatency();
