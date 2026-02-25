export function formatSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const val = bytes / Math.pow(1024, i);
	return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

export function formatDate(iso: string): string {
	const d = new Date(iso);
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	const days = Math.floor(diff / 86400000);

	if (days === 0) {
		const hours = Math.floor(diff / 3600000);
		if (hours === 0) {
			const mins = Math.floor(diff / 60000);
			return mins <= 1 ? 'Just now' : `${mins}m ago`;
		}
		return `${hours}h ago`;
	}
	if (days === 1) return 'Yesterday';
	if (days < 7) return `${days}d ago`;
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export function getFileIcon(type: string): string {
	const icons: Record<string, string> = {
		folder: '\u{1F4C1}',
		image: '\u{1F5BC}\uFE0F',
		video: '\u{1F3AC}',
		audio: '\u{1F3B5}',
		document: '\u{1F4C4}',
		code: '\u{1F4BB}',
		archive: '\u{1F4E6}',
		pdf: '\u{1F4D5}',
		text: '\u{1F4DD}',
		other: '\u{1F4CE}'
	};
	return icons[type] || '\u{1F4CE}';
}
