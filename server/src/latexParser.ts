const _ = require("lodash")
import mtr from "matrmath"
import type { IQuestion } from "./models/questionModel"
import { evaluateTex } from "tex-math-parser"

/**
 * Function that check if 2 latex string are mathematically equal
 * @param question the question for which we want to compare the 2 answers
 * @param str1 the correct answer from the question in latex
 * @param str2 the answer from the user in latex
 * The order of str1 and str2 can be swapped
 * @returns whether the 2 strings are equal
 */
export function checkAnswerEqual(question: IQuestion, str1: string, str2: string): boolean {
    if (question.type === "mc") {
        return str1 === str2
    }
    //If the answer contains commas check if each possible answer is included
    if (str1.includes(",")) {
        const split1 = str1.replace(/ /g, "").split(",")
        const split2 = str2.replace(/ /g, "").split(",")
        if (split1.length != split2.length) return false
        split1.sort()
        split2.sort()

        for (let i = 0; i < split1.length; i++) {
            if (!checkAnswerEqual(question, split1[i], split2[i])) return false
        }

        return true
    }
    //Try to evaluate both strings
    //If this returns an error the string is not in latex
    //For example the answer "No" will throw an error here since it can not be evaluated
    try {
        //Parses the latex and evaluates it into a mathjs type
        const expr1 = evaluateTex(prepareLatex(str1))
        const expr2 = evaluateTex(prepareLatex(str2))
        // If we are not using a special rule just compare the 2 answers
        if (question.specialRule === undefined) return _.isEqual(expr1.evaluated, expr2.evaluated)

        //If the question contains the special rule "multiples-allowed" and both answers contain a matrix, any multiple of any matrix is allowed
        if (
            "isMatrix" in expr1.evaluated &&
            "isMatrix" in expr2.evaluated &&
            question.specialRule === "multiples-allowed"
        ) {
            //In order to compare the 2 matrices we need both of them in their row reduced echolon form (RREF)
            //For this we use the matrmath library, but the array must be 2D
            //So if the array is not 2D yet, we add that here
            if (expr1.evaluated._data[0].constructor !== Array) {
                expr1.evaluated._data = expr1.evaluated._data.map((x) => [x])
            }
            if (expr2.evaluated._data[0] !== Array) {
                expr2.evaluated._data = expr2.evaluated._data.map((x) => [x])
            }
            //Now with 2D arrays, reduce them to RREF
            expr1.evaluated._data = mtr.rowReduce(expr1.evaluated._data)
            expr2.evaluated._data = mtr.rowReduce(expr2.evaluated._data)
        }
        //Compare equality
        return _.isEqual(expr1.evaluated, expr2.evaluated)
    } catch (error) {
        //In case the evaluateTex could not evaluate the string, we will check for string equality.
        return formatString(str1) === formatString(str2)
    }
}

/**
 * A helper function that prepares the string to be parseable for the evaluateTex function
 * This function does not support brackets and pmatrices that is why they are removed
 * Some of the imported questions contain -- or +-, because of copying questions/answers from grasple, so we will remove those for now
 * If the -- is in a matrix it can not be replaced with a + so we replace it with nothing
 * For example [--5, 2] => [5, 2]
 * @param str the string to prepare
 * @returns the prepared string
 */
function prepareLatex(str: string): string {
    //Remove the brackets
    str = str.replace(/\\left\\{/g, "")
    str = str.replace(/\\right\\}/g, "")

    //Replace the pmatrix with a bmatrix
    str = str.replace(/\\begin{pmatrix}/g, "\\begin{bmatrix}")
    str = str.replace(/\\end{pmatrix}/g, "\\end{bmatrix}")

    //Remove the -- and +-
    str = str.replace(/--/g, "")
    str = str.replace(/\+-/g, "-")

    return str
}

/**
 * This function will be called after not being able to parse either answer
 * Now -- will be replaced with a + because we were not able to parse it, it is probably not inside a matrix
 * So we now replace it with a +, for example a -- b => a + b
 * a -- b would not be parseable because they contain variables
 * @param str the string to format
 * @returns the newly formatted string
 */
function formatString(str: string): string {
    //Removes all the additional spaces and backslashes
    str = str.replace(/ |\\/g, "")
    //All answers are checked in lowercase
    str = str.toLowerCase()
    //Replace all the -- and +-
    str = str.replace(/--/g, "+")
    str = str.replace(/\+-/g, "-")
    //Replace all the ne with neq
    str = str.replace(/neq/g, "ne")

    return str
}
