export interface IUser {
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
  rank: number;
  profileImg: string;
  username: string;
  nickname: string;
  amount: number;
}
