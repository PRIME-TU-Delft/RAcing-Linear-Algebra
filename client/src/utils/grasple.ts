/**
 * Helpers for the Grasple exercise links lecturers paste into the lecturer platform.
 *
 * A lecturer can paste either a plain embed URL, e.g.
 *     https://embed.grasple.com/exercises/abc123?id=12345
 * or the whole `<iframe ...>` snippet Grasple offers for embedding.
 */

/** If `input` is an `<iframe>` snippet, returns its `src` URL; otherwise returns `input` unchanged. */
export function extractIframeSrc(input: string): string {
    if (input.includes("<iframe")) {
        const srcMatch = input.match(/src="([^"]+)"/)
        if (srcMatch && srcMatch[1]) {
            return srcMatch[1]
        }
    }
    return input
}

/** Whether `url` points to an embeddable Grasple exercise. */
export function isGraspleExerciseUrl(url: string): boolean {
    return url.includes("embed.grasple.com/exercises")
}

/**
 * Returns the exercise id digits from the `id=` parameter at the very end of `url`,
 * or `null` if the URL does not end with one. The digits are returned as written
 * (leading zeros kept); callers parse them to a number when needed.
 */
export function extractGraspleExerciseId(url: string): string | null {
    const idMatch = url.match(/id=(\d+)$/)
    return idMatch ? idMatch[1] : null
}
