export function getVariantNumberColor(count: number) {
    if (count === 1) {
        return "#D17019";
    } else if (count === 2) {
        return "#fcd839ff";
    } else if (count >= 3) {
        return "#19D1CC";
    } else {
        return "#D17019";
    }
}
