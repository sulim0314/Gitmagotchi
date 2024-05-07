import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-northeast-2_QEPO255Ca",
  ClientId: "ap-northeast-2:eb0125ca-e2cf-4d86-a511-056c6ae6b232",
};

export default new CognitoUserPool(poolData);
