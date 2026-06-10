interface ExperienceDates {
    date_start: string;
    date_end: string | null;
}

/** Años de experiencia desde el inicio del primer empleo hasta hoy */
export function calculateYearsOfExperience(experiences: ExperienceDates[]): number {
    if (experiences.length === 0) return 0;

    const earliestStart = experiences.reduce((min, exp) => {
        const start = new Date(exp.date_start).getTime();
        return start < min ? start : min;
    }, Infinity);

    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const years = (Date.now() - earliestStart) / msPerYear;

    return Math.max(0, Math.round(years));
}
