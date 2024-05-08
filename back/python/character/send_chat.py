import json
import logging
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def generate_text(model_id, body):    
    logger.info("Generating image with Meta Llama 2 Chat model %s", model_id)

    # AWS 리전 설정 및 Bedrock Runtime 클라이언트 생성
    bedrock = boto3.client(
        service_name='bedrock-runtime',
        region_name='us-east-1'
    )
    
    accept = "application/json"
    content_type = "application/json"
    
    response = bedrock.invoke_model(
        body = body, modelId = model_id, accept = accept, contentType = content_type
    )

    response_body = json.loads(response.get('body').read())
    if "generation" in response_body:
        response_body_generation = response_body['generation'].replace('"', '').replace('\n', '').replace('\r', '').replace('```', '').replace('*', '')

    return response_body_generation    

def lambda_handler(event, context):
    json_body = event.get('body')
    
    print("Request:", event)
    print("Received body:", json_body)
    
    if not json_body:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid input data')
        }
        
    obj = json.loads(json_body)
    character_info = obj.get("characterInfo")
    user_input = obj.get("userInput")
    
    name = character_info.get("name")
    level = character_info.get("level")
    fullness = character_info.get("fullness")
    intimacy = character_info.get("intimacy")
    cleanliness = character_info.get("cleanliness")

    print("Request:", user_input)
    print(" ")
    
    language_type = " "
    if level in [3, 4]:
        language_type = "5글자 이내로 단어로만 답해줘."
    elif level in [5, 6]:
        language_type = "20글자 이내로 문장으로 답해줘."
    else:
        language_type = "50글자 이내로 문장으로 답해줘."    
    
    model_id = "meta.llama3-70b-instruct-v1:0"
    max_gen_len = 100
    temperature = 0.5
    top_p = 0.9

    prompt = f"""
    [캐릭터 정보]
    이름 : {name}
    레벨 : {level}
    포만감 : {fullness}/100
    친밀도 : {intimacy}/100
    청결도 : {cleanliness}/100

    [사용자의 입력 내용]
    {user_input}

    [요구사항]
    캐릭터의 입장에서 대답해줘.
    {language_type}.
    가장 중요한 것은 한국어로 대답하기.
    """

    # Create request body
    body = json.dumps({
        "prompt": prompt,
        "max_gen_len": max_gen_len,
        "temperature": temperature,
        "top_p": top_p
    })

    if level >= 3:
        try:
            response = generate_text(model_id, body)
        except ClientError as err:
            message = err.response["Error"]["Message"]
            logger.error("A client error occurred: %s", message)
            print("A client error occured: " +
                format(message))
            response = "지금은 말 할 기분이 아니에요.."
        else:
            print(
                f"Finished generating text with Meta Llama 2 Chat model {model_id}.")

    else:
        response = "(말 못함)"
    
    print("Response:", response)

    # 응답 구성
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(response)
    }