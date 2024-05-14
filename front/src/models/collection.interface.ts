import { IBaseEntity } from "@/models";

export interface ICollection extends IBaseEntity {
  id: number;
  characterName: string;
  userId: number;
  ending: "INDEPENDENT" | "HUNGRY" | "SICK" | "RUNAWAY";
  fullnessStat: number;
  intimacyStat: number;
  cleannessStat: number;
  characterUrl: string;
}
