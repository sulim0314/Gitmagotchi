export interface ICharacter {
  id: number;
  userId: number;
  name: string;
  exp: number;
  faceUrl: string;
  characterUrl: string;
}

export interface ICharacterStatus {
  characterId: number;
  userId: number;
  fullness: number;
  intimacy: number;
  cleanness: number;
  lastUpdatedFullness: string;
  lastUpdatedIntimacy: string;
  lastUpdatedCleanness: string;
}

export interface ICharacterStat {
  characterId: number;
  userId: number;
  fullnessStat: number;
  intimacyStat: number;
  cleannessStat: number;
  unusedStat: number;
}

export interface ICharacterMotion {
  id: number;
  motionUrl: string;
  requiredExp: number;
  name: string;
  isStatic: boolean;
}

export type InteractType = "SHOWER" | "WALK" | "CHAT_POSITIVE" | "CHAT_NEGATIVE" | "EAT";
