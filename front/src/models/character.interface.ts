export interface ICharacter {
  characterId: number;
  userId: number;
  name: string;
  exp: number;
  faceUrl: string;
  characterUrl: string;
  status: ICharacterStatus;
  stat: ICharacterStat;
}

export interface ISimpleCharacter {
  characterId: number;
  userId: number;
  name: string;
  exp: number;
  faceUrl: string;
  characterUrl: string;
}

export interface ICharacterStatus {
  fullness: number;
  intimacy: number;
  cleanness: number;
}

export interface ICharacterStat {
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
