export type MenuItem = {
  label: string;
  page: string;
  book?: string;
};

export type QuizChoice = {
  label: string;
  correct: boolean;
};

export type Quiz = {
  choices: QuizChoice[];
  next?: string;
  again?: string;
  scored?: boolean;
  objective?: number;
};

export type ReviewItem = {
  label: string;
  objective: number;
  page: string;
};

export type Page = {
  id: string;
  text: string[];
  jumps: string[];
  sends?: string[];
  continue?: string;
  outside?: { label: string; book: string; page: string };
  items?: MenuItem[];
  quiz?: Quiz;
  review?: ReviewItem[];
  kind?: "help";
  help?: { page: string; word?: string };
};

export type Lesson = {
  id: string;
  title: string;
  shells?: string[];
  pages: Page[];
  menu?: MenuItem[];
};

export type Session = {
  open: boolean;
  responses: { pageId: string; value: string }[];
  bookmark: string | null;
};

export type Book = {
  id: string;
  title: string;
  pages: Page[];
  index: number;
  log: string[];
  score: number;
  session: Session;
  menu: MenuItem[];
  helpFrom: number | null;
};
