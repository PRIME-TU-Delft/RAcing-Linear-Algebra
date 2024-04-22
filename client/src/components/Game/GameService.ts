export function getRacePathSizeAndOffsetMargins(viewportWidth: number, viewportHeight: number) {
    const newWidth = viewportWidth * 0.4
    const newHeight = viewportHeight * 0.4
    const offsetX = viewportWidth * 0.6
    const offsetY = viewportHeight * 0.2

    const halfScreenWidth = viewportWidth * 0.5
    const widthCenterMargin = (halfScreenWidth - newWidth) / 2

    return {
        width: newWidth,
        height: newHeight,
        offsetX: halfScreenWidth + widthCenterMargin,
        offsetY: offsetY
    }
}