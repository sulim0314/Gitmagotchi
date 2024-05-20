export interface IAuth {
  username: string;
  attributes: {
    email: string;
    email_verified: string;
    identities: string;
    name: string;
    picture: string;
    sub: string;
  };
  id?: string;
}
