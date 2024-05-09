export interface ICollection {
  id: number;
  characterName: string;
  userId: number;
  ending: "INDEPENDENT" | "HUNGRY" | "SICK" | "RUNAWAY";
  fullnessStat: number;
  intimacyStat: number;
  cleannessStat: number;
  characterUrl: string;
}
