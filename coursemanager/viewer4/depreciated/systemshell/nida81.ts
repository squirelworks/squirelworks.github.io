/** Core book for every Nida lesson. A module, not a lesson shell. */

export const nida81 = {
  id: "nida81",
  splash: {
    id: "P0",
    text: [
      "Nida Corporation 1997 - 2005",
      "This software and its supporting programs are protected by federal copyright law and all rights are reserved by Nida Corporation.",
    ],
    continue: "Click to continue",
  },
  courseMenu: {
    id: "P20001",
    text: ["Use your mouse to make selections."],
  },
  directions: {
    id: "P10020",
    text: [
      "Read each question carefully before selecting an answer.",
      "There is only one correct response to each question.",
      "Choose the response that best answers the question.",
      "When all questions have been answered you will receive a score based on the number of correct responses.",
    ],
  },
};

export function callsNida(book: string): boolean {
  return book.toLowerCase() === "nida81.tbk";
}
