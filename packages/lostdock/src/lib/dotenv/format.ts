function formatKV(key: string, value: string) {
	if (value.includes('"')) {
		return `${key}='${value}'`;
	}
	return `${key}="${value}"`;
}

export function dotenvFormat(obj: Record<string, string>) {
	return Object.entries(obj)
		.map(([key, value]) => formatKV(key, value))
		.join("\n");
}
