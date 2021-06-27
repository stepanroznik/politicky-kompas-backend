/**
 * Toggles a specified (boolean) property in the given object
 * after the timeout (ms)
 *
 * @param object {}
 * @param flagName name of the boolean property
 * @param timeout ms
 * @returns Promise<null>
 */
export function toggleFlagTimeout(
    object: any,
    flagName: string,
    timeout: number,
) {
    return new Promise((resolve) => {
        setTimeout(() => {
            object[flagName] = !object[flagName];
            resolve(null);
        }, timeout);
    });
}
