import json

def get_max_value_by_exp(exp):
    if exp < 25: return 100
    if exp < 65: return 110
    if exp < 90: return 120
    if exp < 120: return 130
    if exp < 150: return 150
    if exp < 190: return 170    
    return 200
    
def get_max_intimacy(stat):
    if stat == 0: return 0
    if stat < 8: return (stat + 1) * 5
    if stat == 8: return 50
    if stat == 9: return 70
    return 100

def get_fullness_increase(stat):
    return 15 + 5 * stat if stat < 10 else 70

def lambda_handler(event, context):    
    try:
        json_body = event.get('body')
        # event로부터 사용자 정보를 추출합니다.
        obj = json.loads(json_body)
        print(obj)
        exp = obj.get("exp")
        interactType = obj.get("interactType")

        stat = obj.get("status")
        fullness = stat.get("fullness")
        intimacy = stat.get("intimacy")
        cleanness = stat.get("cleanness")

        status = obj.get("stat")
        fullnessStat = status.get("fullnessStat")
        intimacyStat = status.get("intimacyStat")
        
        maxValue = get_max_value_by_exp(exp)
        intimacy_max = maxValue + get_max_intimacy(intimacyStat)

        if interactType == "SHOWER":
            if cleanness == maxValue:
                message = "청결도가 이미 최대입니다."
            else:
                before = cleanness
                cleanness = min(maxValue, cleanness + 20)
                exp += 10
                message = f"샤워를 하여 청결도 {cleanness - before}, 경험치 10 만큼 획득했습니다."
        elif interactType == "WALK":
            if intimacy == intimacy_max:
                message = "친밀도가 이미 최대입니다."
            else:
                before = intimacy
                intimacy = min(maxValue + intimacy_max, intimacy + 10)
                exp += 5
                message = f"산책을 하여 친밀도 {intimacy - before}, 경험치 5 만큼 획득했습니다."
        elif interactType == "CHAT_POSITIVE":
            if intimacy == intimacy_max:
                message = "친밀도가 이미 최대입니다."
            else:
                before = intimacy
                intimacy = min(maxValue + intimacy_max, intimacy + 20)
                exp += 10
                message = f"긍정적인 대화로 친밀도 {intimacy - before}, 경험치 10 만큼 획득했습니다."
        elif interactType == "CHAT_NEGATIVE":
            before = intimacy
            intimacy = max(0, intimacy - 10)
            message = f"부정적인 대화로 친밀도 {before - intimacy} 만큼 감소했습니다."
        elif interactType == "EAT":
            if fullness == maxValue:
                message = "포만감이 이미 최대입니다."
            else:
                before = fullness
                fullnessIncrease = get_fullness_increase(fullnessStat)
                fullness = min(maxValue, fullness + fullnessIncrease)
                exp += 10
                message = f"식사를 하여 포만감 {fullness - before}, 경험치 10 만큼 획득했습니다."
        else:
            raise ValueError(f"Invalid interactType : {interactType}")        

        characterInfo = {
            'exp': exp,
            'fullness': fullness,
            'intimacy': intimacy,
            'cleanness': cleanness,
            'interactType': interactType,
            'message': message
        }

        return {
            'statusCode': 200,
            'body': json.dumps(characterInfo)
        }
    except ValueError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }        