import { IBaseEntity } from "@/models";

export interface IUser extends IBaseEntity {
  id: number;
  githubToken: string;
  githubUsername: string;
  gold: number;
  lastTime: string;
  meal: number;
  nickname: string;
  profileImg: string;
  characterId: number | null;
  backgroundUrl: string;
}

export interface IRanking {
  id: number;
  githubToken: string;
  githubUsername: string;
  gold: number;
  lastTime: string;
  meal: number;
  nickname: string;
  profileImg: string;
  characterId: number | null;
  backgroundUrl: string;
  collectionCount: number;
}
