import type { Lesson } from "../systemshell/types";

export type Course = {
  id: string;
  title: string;
  lesson: Lesson;
};

const loaded = import.meta.glob("./*.json", { eager: true }) as Record<
  string,
  { default: Lesson }
>;

export const courses: Course[] = Object.entries(loaded)
  .map(([, file]) => file.default)
  .filter((lesson) => Array.isArray(lesson?.pages))
  .map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    lesson,
  }))
  .sort((a, b) => a.title.localeCompare(b.title));
