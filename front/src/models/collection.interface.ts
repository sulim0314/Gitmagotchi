export interface ICollection {
  id: number;
  characterName: string;
  userId: number;
  ending: "졸업" | "아사" | "병사" | "가출";
  fullnessStat: number;
  intimacyStat: number;
  cleannessStat: number;
  characterUrl: string;
}
