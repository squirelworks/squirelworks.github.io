import type { Lesson } from "../systemshell/types";
import catalogFile from "./courses/catalog.json";

export type ShelfCourse = {
  id: string;
  title: string;
  file?: string | null;
  lesson: Lesson | null;
};

export type ShelfModule = {
  title: string;
  courses: ShelfCourse[];
};

export type ShelfTopic = {
  title: string;
  modules: ShelfModule[];
};

const loaded = import.meta.glob("./courses/**/*.json", { eager: true }) as Record<string, { default: Lesson }>;

function safeName(name: string) {
  return name.replace(/[<>:"/\\|?*]/g, "-").replace(/\s+/g, " ").trim().replace(/^[. ]+|[. ]+$/g, "") || "untitled";
}

function lessonAt(file: string | null): Lesson | null {
  if (!file) return null;
  const hit = Object.entries(loaded).find(([key]) => key.replaceAll("\\", "/").endsWith(file));
  const lesson = hit?.[1].default;
  return lesson && Array.isArray(lesson.pages) ? lesson : null;
}

export const topics: ShelfTopic[] = catalogFile.topics.map((topic) => ({
  title: topic.title,
  modules: topic.modules.map((module) => ({
    title: module.title,
    courses: module.courses.map((course) => ({
      id: course.id,
      title: course.title,
      lesson:
        lessonAt(course.file) ??
        lessonAt(`${safeName(topic.title)}/${safeName(module.title)}/${course.id}.json`),
    })),
  })),
}));
