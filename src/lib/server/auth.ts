import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

const JWT_SECRET = env.JWT_SECRET || 'fallback-dev-secret';
const PASSWORD = env.FILE_SERVER_PASSWORD || 'admin';

export async function verifyPassword(input: string): Promise<boolean> {
	return input === PASSWORD;
}

export function createToken(): string {
	return jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): boolean {
	try {
		jwt.verify(token, JWT_SECRET);
		return true;
	} catch {
		return false;
	}
}
