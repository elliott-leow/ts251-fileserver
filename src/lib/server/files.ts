import { readdir, stat } from 'fs/promises';
import { join, resolve, extname } from 'path';
import { env } from '$env/dynamic/private';

const FILE_ROOT = env.FILE_ROOT || '/share/Public';

export interface FileEntry {
	name: string;
	path: string;
	isDirectory: boolean;
	size: number;
	modified: string;
	extension: string;
	type: FileType;
}

export type FileType = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'pdf' | 'text' | 'other';

const EXT_MAP: Record<string, FileType> = {
	'.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image',
	'.webp': 'image', '.svg': 'image', '.bmp': 'image', '.ico': 'image', '.avif': 'image',
	'.mp4': 'video', '.mkv': 'video', '.avi': 'video', '.mov': 'video',
	'.webm': 'video', '.flv': 'video', '.wmv': 'video', '.m4v': 'video',
	'.mp3': 'audio', '.flac': 'audio', '.wav': 'audio', '.ogg': 'audio',
	'.m4a': 'audio', '.aac': 'audio', '.wma': 'audio', '.opus': 'audio',
	'.pdf': 'pdf', '.doc': 'document', '.docx': 'document',
	'.xls': 'document', '.xlsx': 'document', '.ppt': 'document', '.pptx': 'document',
	'.odt': 'document', '.ods': 'document',
	'.js': 'code', '.ts': 'code', '.py': 'code', '.rs': 'code', '.go': 'code',
	'.java': 'code', '.c': 'code', '.cpp': 'code', '.h': 'code', '.css': 'code',
	'.html': 'code', '.json': 'code', '.yaml': 'code', '.yml': 'code',
	'.toml': 'code', '.xml': 'code', '.sql': 'code', '.sh': 'code',
	'.svelte': 'code', '.vue': 'code', '.jsx': 'code', '.tsx': 'code',
	'.nix': 'code', '.conf': 'code', '.ini': 'code',
	'.txt': 'text', '.md': 'text', '.log': 'text', '.csv': 'text', '.rtf': 'text',
	'.zip': 'archive', '.tar': 'archive', '.gz': 'archive', '.bz2': 'archive',
	'.7z': 'archive', '.rar': 'archive', '.xz': 'archive',
};

function getFileType(ext: string, isDir: boolean): FileType {
	if (isDir) return 'folder';
	return EXT_MAP[ext.toLowerCase()] || 'other';
}

export function safePath(requestedPath: string | undefined): string | null {
	const root = resolve(FILE_ROOT);
	const p = requestedPath || '';
	const full = resolve(root, p);
	if (!full.startsWith(root)) return null;
	return full;
}

export async function listDirectory(dirPath: string): Promise<FileEntry[]> {
	const root = resolve(FILE_ROOT);
	const entries = await readdir(dirPath, { withFileTypes: true });

	const files: FileEntry[] = [];

	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;

		try {
			const fullPath = join(dirPath, entry.name);
			const info = await stat(fullPath);
			const ext = extname(entry.name);
			const relativePath = fullPath.slice(root.length).replace(/\\/g, '/');

			files.push({
				name: entry.name,
				path: relativePath,
				isDirectory: entry.isDirectory(),
				size: info.size,
				modified: info.mtime.toISOString(),
				extension: ext,
				type: getFileType(ext, entry.isDirectory())
			});
		} catch {
			// Skip files we can't stat
		}
	}

	files.sort((a, b) => {
		if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
		return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
	});

	return files;
}

export function getRoot(): string {
	return resolve(FILE_ROOT);
}
