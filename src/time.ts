export const timeStart = (name: string) => console.time(`##[time] ${name}`);

export const timeDone = (name: string) => console.timeEnd(`##[time] ${name}`);
