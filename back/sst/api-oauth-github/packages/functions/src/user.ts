import fetch from "node-fetch";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = await (
    await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        authorization:
          "token " + event.headers["authorization"].split("Bearer ")[1],
        accept: "application/json",
      },
    })
  ).json();

  // AWS SDK를 사용하여 SQS 클라이언트 초기화
  // const AWS = require("aws-sdk");
  // const sqs = new AWS.SQS();

  // const params = {
  //   MessageBody: JSON.stringify({
  //     userId: token.id,
  //     githubUsername: token.login,
  //     profileImg: token.avatar_url,
  //     nickname: token.name,
  //   }),
  //   QueueUrl:
  //     "https://sqs.ap-northeast-2.amazonaws.com/992382698264/SignInOrSignUp.fifo",
  //   MessageGroupId: "AuthUser", // 메시지 그룹 ID
  // };

  // SQS 큐에 메시지 추가
  // await sqs.sendMessage(params).promise();

  return {
    statusCode: 200, // HTTP 응답 코드 추가
    body: JSON.stringify({ status: "Message sent", sub: token.id, ...token }),
  };
};
