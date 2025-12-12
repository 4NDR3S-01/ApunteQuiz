/**
 * Utilidad para debounce de funciones
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Debounce para funciones async
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let latestArgs: Parameters<T> | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    latestArgs = args;

    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        if (latestArgs) {
          try {
            const result = await func(...latestArgs);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      }, wait);
    });
  };
}
