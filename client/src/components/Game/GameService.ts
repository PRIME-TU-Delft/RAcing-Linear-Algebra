export function getRacePathSizeAndOffsetMargins(viewportWidth: number, viewportHeight: number) {
    let newWidth = viewportWidth * 0.4
    let newHeight = viewportHeight * 0.4
    let offsetY = viewportHeight * 0.4

    const halfScreenWidth = viewportWidth * 0.5
    const widthCenterMargin = (halfScreenWidth - newWidth) / 2
    let offsetX = halfScreenWidth + widthCenterMargin
    
    if (viewportWidth <= 1024) {
        newWidth = viewportWidth * 0.35
        offsetX = viewportWidth * 0.5 + (viewportWidth * 0.6 - newWidth) / 2
    }

    if (viewportWidth >= 2000) {
        newWidth = viewportWidth * 0.35
        offsetX = viewportWidth * 0.5 + (viewportWidth * 0.6 - newWidth) / 2
    }

    if (viewportHeight <= 700) {
        newHeight = viewportHeight * 0.35
        offsetY = viewportHeight * 0.5
    }

    if (viewportHeight > 700 && viewportHeight < 800) {
        newHeight = viewportHeight * 0.4
        offsetY = viewportHeight * 0.4
    }

    if (viewportHeight > 800 && viewportHeight <= 900) {
        newHeight = viewportHeight * 0.4
        offsetY = viewportHeight * 0.5
    }

    if (viewportHeight > 900 && viewportHeight <= 1050) {
        newHeight = viewportHeight * 0.4
        offsetY = viewportHeight * 0.45
    }

    if (viewportHeight > 1050 && viewportHeight <= 1250) {
        newHeight = viewportHeight * 0.45
        offsetY = viewportHeight * 0.4
    }

    if (viewportWidth >= 2000 && viewportHeight <= 1350) {
        offsetY = viewportHeight * 0.5
    }

    return {
        width: newWidth,
        height: newHeight,
        offsetX: offsetX,
        offsetY: offsetY
    }
}

export interface QuestionStatus {
    questionStarted: boolean;
    questionFinished: boolean;
}