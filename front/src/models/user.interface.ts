export interface IUser {
  id: number;
  profileImg: string;
  nickname: string;
  gold: number;
  meal: number;
  lastTime: string;
}

export interface IRanking {
  rank: number;
  profileImg: string;
  username: string;
  nickname: string;
  amount: number;
}
