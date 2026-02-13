export const calculateAge = (nationalId) => {
    if (!nationalId || typeof nationalId !== 'string' || nationalId.length !== 14) {
        return null;
    }

    const century = parseInt(nationalId[0]);
    const yearPart = parseInt(nationalId.substring(1, 3));
    const month = parseInt(nationalId.substring(3, 5)) - 1; // Months are 0-indexed in Date
    const day = parseInt(nationalId.substring(5, 7));

    let fullYear;
    if (century === 2) {
        fullYear = 1900 + yearPart;
    } else if (century === 3) {
        fullYear = 2000 + yearPart;
    } else {
        return null; // Invalid century for current valid IDs or future ones not handled
    }

    const birthDate = new Date(fullYear, month, day);
    const today = new Date();

    // Validate date components (e.g. prevent month 99 or day 99)
    if (birthDate.getFullYear() !== fullYear || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
        return null;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 0 ? age : null;
};
