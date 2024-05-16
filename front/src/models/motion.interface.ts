export interface IMotion {
  default: IAnimation;
  hello: IAnimation;
  meal: IAnimation;
  walk: IAnimation;
  shower: IAnimation;
  motion: IAnimation[];
}

export interface IAnimation {
  motion: string;
  frames: number;
}
