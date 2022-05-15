import { IDisposable } from ".";
/**
 * Provides a convenient syntax that ensures the correct use of IDisposable objects
 */
export async function using<T extends IDisposable>(
	resource: T,
	func: (resource: T) => Promise<void>
) {
	try {
		await func(resource);
	} finally {
		await resource.dispose();
	}
}
