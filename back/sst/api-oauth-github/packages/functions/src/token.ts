import fetch from "node-fetch";
import parser from "lambda-multipart-parser";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const result = await parser.parse(event);
  const token = await (
    await fetch(
      `https://github.com/login/oauth/access_token?client_id=${result.client_id}&client_secret=${result.client_secret}&code=${result.code}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      }
    )
  ).json();

  console.log(token);
  console.log(token.access_token); // DB에 넣자

  // AWS SDK를 사용하여 SQS 클라이언트 초기화
  const AWS = require("aws-sdk");
  const sqs = new AWS.SQS();

  const params = {
    MessageBody: JSON.stringify({
      token: token.access_token,
    }),
    QueueUrl:
      "https://sqs.ap-northeast-2.amazonaws.com/992382698264/token.fifo", // SQS 큐test URL
    MessageGroupId: "GithubToken", // 메시지 그룹 ID
  };

  // SQS 큐에 메시지 추가
  await sqs.sendMessage(params).promise();

  return token;
};
