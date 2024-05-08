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
}

export interface ICharacterStat {
  characterId: number;
  userId: number;
  fullnessStat: number;
  intimacyStat: number;
  cleannessStat: number;
}

export interface ICharacterMotion {
  id: number;
  motionUrl: string;
  requiredExp: number;
  name: string;
  isStatic: boolean;
}
