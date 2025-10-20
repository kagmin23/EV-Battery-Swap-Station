export const formatDateVN = (date: Date): string => {
    try {
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
        return '';
    }
};

export const formatTimeVN = (date: Date): string => {
    try {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return '';
    }
};

export const extractDateAndTime = (isoString: string) => {
    if (!isoString) return { date: '', time: '' };
    const dateObj = new Date(isoString);
    const date = ('0' + dateObj.getDate()).slice(-2) + '/' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '/' + dateObj.getFullYear();
    const time = ('0' + dateObj.getHours()).slice(-2) + ':' + ('0' + dateObj.getMinutes()).slice(-2);
    return { date, time };
};

