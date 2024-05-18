package character.image.service;

import static chat.handler.Claude3Handler.*;

import java.io.IOException;

import org.json.JSONObject;

public class Translate {

	public static String translate(String userInput) throws IOException {
		String prompt = String.format("""
        아래 단어를 영어로 번역해줘. 대화 이외의 나머지 단어 및 문장들은 다 제거해줘. \n
        %s
        """, userInput);
		JSONObject response = invokeModelWithResponseStream(prompt);
		String responseText = response.optJSONArray("content").optJSONObject(0).optString("text"); // 'content' 배열의 첫 번째 객체의 'text' 필드 추출

		System.out.println("번역: " + responseText);
		return responseText;
	}

}
