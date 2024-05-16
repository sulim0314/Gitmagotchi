export interface IUser {
  id: number;
  profileImg: string;
  nickname: string;
  githubUsername: string;
  gold: number;
  meal: number;
  lastTime: string;
  backgroundId?: number;
  characterId?: number;
  githubToken?: string;
}

export interface IRanking {
  rank: number;
  profileImg: string;
  username: string;
  nickname: string;
  amount: number;
}
