package character.image.service;

import static chat.handler.Claude3Handler.*;

import java.io.IOException;

import org.json.JSONObject;

public class Translate {

	public static String translate(String userInput) throws IOException {
		String prompt = String.format("""
        캐릭터를 생성하기 위해 사용자 입력을 받을 거야. 사용자 입력이 캐릭터인 것을 인지 하고, 이 입력을 영어로 번역해줘. \n
        예를 들어, "새" 라는 입력이 들어오면 "new"가 아니라 "bird"인거야. \n
        아래 단어를 영어로 번역해줘. 대화 이외의 나머지 단어 및 문장들은 다 제거해줘. \n
        %s
        """, userInput);
		JSONObject response = invokeModelWithResponseStream(prompt);
		String responseText = response.optJSONArray("content").optJSONObject(0).optString("text"); // 'content' 배열의 첫 번째 객체의 'text' 필드 추출

		System.out.println("번역: " + responseText);
		return responseText;
	}

}
