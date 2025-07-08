
export const toPersianDigits = (n: number | string): string => {
    const persianDigits: { [key: string]: string } = {
        '0': '۰',
        '1': '۱',
        '2': '۲',
        '3': '۳',
        '4': '۴',
        '5': '۵',
        '6': '۶',
        '7': '۷',
        '8': '۸',
        '9': '۹'
    };
    return String(n).replace(/[0-9]/g, (w) => persianDigits[w]);
};
