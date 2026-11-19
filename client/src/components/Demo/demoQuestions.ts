/**
 * Self-contained linear algebra questions for the offline conference demo.
 *
 * The real game embeds Grasple exercises chosen by the lecturer. The demo has to run
 * without a server or internet connection, so it generates small randomized exercises
 * locally instead. Every generator returns a fresh variant, so repeat visitors see new numbers.
 */

export type DemoDifficulty = "mandatory" | "easy" | "medium" | "hard"

export interface DemoQuestion {
    id: string
    difficulty: DemoDifficulty
    /** Text with inline LaTeX between $$..$$ */
    prompt: string
    /** "mc" questions show buttons, "numeric" questions show an input field */
    type: "mc" | "numeric"
    options?: string[]
    /** For mc: the correct option. For numeric: the correct value */
    answer: string | number
    /** LaTeX/text shown when the player runs out of attempts */
    explanation: string
}

export const DIFFICULTY_SETTINGS: Record<DemoDifficulty, { basePoints: number; attempts: number }> = {
    mandatory: { basePoints: 50, attempts: 2 },
    easy: { basePoints: 10, attempts: 1 },
    medium: { basePoints: 50, attempts: 2 },
    hard: { basePoints: 150, attempts: 3 },
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randNonZero = (min: number, max: number) => {
    let x = 0
    while (x === 0) x = randInt(min, max)
    return x
}
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]
const shuffle = <T,>(items: T[]): T[] => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

const matrix = (rows: (number | string)[][]) =>
    `\\begin{bmatrix} ${rows.map((r) => r.join(" & ")).join(" \\\\ ")} \\end{bmatrix}`
const vector = (entries: (number | string)[]) => matrix(entries.map((x) => [x]))

/** Builds 4 distinct options containing the correct answer */
function numericOptions(correct: number, distractors: number[]): string[] {
    const options = new Set<number>([correct])
    for (const d of distractors) {
        if (options.size >= 4) break
        options.add(d)
    }
    let offset = 1
    while (options.size < 4) {
        options.add(correct + offset)
        offset = offset > 0 ? -offset : -offset + 1
    }
    return shuffle(Array.from(options)).map(String)
}

let questionCounter = 0
const nextId = () => `demo-q-${questionCounter++}`

// ---------- Easy: multiple choice / true-false, one attempt ----------

const easyGenerators: (() => DemoQuestion)[] = [
    () => {
        const a = randInt(-5, 5)
        const d = randInt(-5, 5)
        const det = a * d
        return {
            id: nextId(),
            difficulty: "easy",
            prompt: `What is the determinant of $$A = ${matrix([[a, 0], [0, d]])}$$?`,
            type: "mc",
            options: numericOptions(det, [a + d, -det, a - d]),
            answer: String(det),
            explanation: `For a diagonal matrix the determinant is the product of the diagonal: $$${a} \\cdot ${d} = ${det}$$`,
        }
    },
    () => {
        const u = [randInt(-4, 4), randInt(-4, 4)]
        const v = [randInt(-4, 4), randInt(-4, 4)]
        const sum = [u[0] + v[0], u[1] + v[1]]
        const correct = `(${sum[0]}, ${sum[1]})`
        const options = new Set<string>([correct, `(${u[0] - v[0]}, ${u[1] - v[1]})`, `(${sum[1]}, ${sum[0]})`, `(${sum[0] + 1}, ${sum[1] - 1})`])
        let k = 2
        while (options.size < 4) options.add(`(${sum[0] + k}, ${sum[1]})`), k++
        return {
            id: nextId(),
            difficulty: "easy",
            prompt: `Compute $$u + v$$ for $$u = ${vector(u)}$$ and $$v = ${vector(v)}$$.`,
            type: "mc",
            options: shuffle(Array.from(options)),
            answer: correct,
            explanation: `Add entry by entry: $$u + v = ${vector(sum)}$$`,
        }
    },
    () => {
        const statements: { text: string; truth: boolean; why: string }[] = [
            { text: "For all square matrices $$A, B$$: $$AB = BA$$.", truth: false, why: "Matrix multiplication is not commutative in general." },
            { text: "For every square matrix $$A$$: $$\\det(A^T) = \\det(A)$$.", truth: true, why: "Transposing does not change the determinant." },
            { text: "If $$A$$ is invertible, then $$\\det(A) \\neq 0$$.", truth: true, why: "A square matrix is invertible exactly when its determinant is non-zero." },
            { text: "Every real $$2 \\times 2$$ matrix has a real eigenvalue.", truth: false, why: "A rotation by 90° has no real eigenvalues." },
            { text: "The columns of an invertible $$n \\times n$$ matrix span $$\\mathbb{R}^n$$.", truth: true, why: "Invertible means the columns form a basis of $$\\mathbb{R}^n$$." },
            { text: "If $$Ax = 0$$ has a non-zero solution, then $$A$$ is invertible.", truth: false, why: "A non-trivial null space means $$A$$ is singular." },
        ]
        const s = pick(statements)
        return {
            id: nextId(),
            difficulty: "easy",
            prompt: `True or false? ${s.text}`,
            type: "mc",
            options: ["True", "False"],
            answer: s.truth ? "True" : "False",
            explanation: s.why,
        }
    },
]

// ---------- Medium: numeric answer, two attempts ----------

const mediumGenerators: (() => DemoQuestion)[] = [
    () => {
        const [a, b, c, d] = [randInt(-6, 6), randInt(-6, 6), randInt(-6, 6), randInt(-6, 6)]
        const det = a * d - b * c
        return {
            id: nextId(),
            difficulty: "medium",
            prompt: `Compute $$\\det ${matrix([[a, b], [c, d]])}$$.`,
            type: "numeric",
            answer: det,
            explanation: `$$ad - bc = (${a})(${d}) - (${b})(${c}) = ${det}$$`,
        }
    },
    () => {
        const u = [randInt(-5, 5), randInt(-5, 5), randInt(-5, 5)]
        const v = [randInt(-5, 5), randInt(-5, 5), randInt(-5, 5)]
        const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
        return {
            id: nextId(),
            difficulty: "medium",
            prompt: `Compute the dot product $$u \\cdot v$$ for $$u = ${vector(u)}$$ and $$v = ${vector(v)}$$.`,
            type: "numeric",
            answer: dot,
            explanation: `$$u \\cdot v = ${u.map((x, i) => `(${x})(${v[i]})`).join(" + ")} = ${dot}$$`,
        }
    },
    () => {
        const A = [
            [randInt(-4, 4), randInt(-4, 4)],
            [randInt(-4, 4), randInt(-4, 4)],
        ]
        const x = [randInt(-4, 4), randInt(-4, 4)]
        const row = randInt(0, 1)
        const result = A[row][0] * x[0] + A[row][1] * x[1]
        return {
            id: nextId(),
            difficulty: "medium",
            prompt: `Let $$A = ${matrix(A)}$$ and $$x = ${vector(x)}$$. What is the ${row === 0 ? "first" : "second"} entry of $$Ax$$?`,
            type: "numeric",
            answer: result,
            explanation: `Row ${row + 1} of $$A$$ times $$x$$: $$(${A[row][0]})(${x[0]}) + (${A[row][1]})(${x[1]}) = ${result}$$`,
        }
    },
    () => {
        const l1 = randInt(-5, 6)
        let l2 = randInt(-5, 6)
        while (l2 === l1) l2 = randInt(-5, 6)
        const b = randNonZero(-5, 5)
        const largest = Math.max(l1, l2)
        return {
            id: nextId(),
            difficulty: "medium",
            prompt: `What is the largest eigenvalue of $$A = ${matrix([[l1, b], [0, l2]])}$$?`,
            type: "numeric",
            answer: largest,
            explanation: `For a triangular matrix the eigenvalues are the diagonal entries $$${l1}$$ and $$${l2}$$, so the largest is $$${largest}$$.`,
        }
    },
]

// ---------- Hard: numeric answer, three attempts ----------

const hardGenerators: (() => DemoQuestion)[] = [
    () => {
        const M = [0, 1, 2].map(() => [randInt(-3, 3), randInt(-3, 3), randInt(-3, 3)])
        const det =
            M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
            M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
            M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
        return {
            id: nextId(),
            difficulty: "hard",
            prompt: `Compute $$\\det ${matrix(M)}$$.`,
            type: "numeric",
            answer: det,
            explanation: `Cofactor expansion along the first row gives $$${det}$$.`,
        }
    },
    () => {
        // A = P D P^-1 with P = [[1,1],[1,2]], P^-1 = [[2,-1],[-1,1]] so that A has integer entries
        const l1 = randInt(-4, 5)
        let l2 = randInt(-4, 5)
        while (l2 === l1) l2 = randInt(-4, 5)
        const A = [
            [2 * l1 - l2, -l1 + l2],
            [2 * l1 - 2 * l2, -l1 + 2 * l2],
        ]
        const largest = Math.max(l1, l2)
        return {
            id: nextId(),
            difficulty: "hard",
            prompt: `What is the largest eigenvalue of $$A = ${matrix(A)}$$?`,
            type: "numeric",
            answer: largest,
            explanation: `The characteristic polynomial $$\\lambda^2 - ${l1 + l2 < 0 ? `(${l1 + l2})` : l1 + l2}\\lambda + ${l1 * l2 < 0 ? `(${l1 * l2})` : l1 * l2}$$ has roots $$${l1}$$ and $$${l2}$$.`,
        }
    },
    () => {
        // Unique integer solution: pick x, compute b = A x with det(A) != 0
        let A = [[0, 0], [0, 0]]
        while (A[0][0] * A[1][1] - A[0][1] * A[1][0] === 0) {
            A = [
                [randInt(-4, 4), randInt(-4, 4)],
                [randInt(-4, 4), randInt(-4, 4)],
            ]
        }
        const x = [randInt(-5, 5), randInt(-5, 5)]
        const b = [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]]
        const askFirst = Math.random() < 0.5
        return {
            id: nextId(),
            difficulty: "hard",
            prompt: `Solve $$${matrix(A)} ${vector(["x_1", "x_2"])} = ${vector(b)}$$. What is $$${askFirst ? "x_1" : "x_2"}$$?`,
            type: "numeric",
            answer: askFirst ? x[0] : x[1],
            explanation: `The unique solution is $$x_1 = ${x[0]},\\; x_2 = ${x[1]}$$.`,
        }
    },
]

/** The first question of a round is "mandatory" (as in the real game), before players choose difficulties */
export function generateMandatoryQuestion(): DemoQuestion {
    return { ...pick(mediumGenerators)(), difficulty: "mandatory" }
}

export function generateQuestion(difficulty: "easy" | "medium" | "hard"): DemoQuestion {
    switch (difficulty) {
        case "easy":
            return pick(easyGenerators)()
        case "medium":
            return pick(mediumGenerators)()
        case "hard":
            return pick(hardGenerators)()
    }
}

/** Accepts integers, decimals (comma or dot) and simple fractions like -3/2 */
export function parseNumericAnswer(input: string): number | null {
    const cleaned = input.trim().replace(",", ".").replace(/\s+/g, "").replace("−", "-")
    if (cleaned === "") return null
    const fraction = cleaned.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/)
    if (fraction) {
        const denominator = parseFloat(fraction[2])
        return denominator === 0 ? null : parseFloat(fraction[1]) / denominator
    }
    const value = Number(cleaned)
    return Number.isFinite(value) ? value : null
}

export function isCorrect(question: DemoQuestion, given: string): boolean {
    if (question.type === "mc") return given === question.answer
    const value = parseNumericAnswer(given)
    return value !== null && Math.abs(value - (question.answer as number)) < 1e-6
}
