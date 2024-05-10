import json

def get_max_value_by_exp(exp):
    if exp < 25:
        return 100
    elif exp < 65:
        return 110
    elif exp < 90:
        return 120
    elif exp < 120:
        return 130
    elif exp < 150:
        return 150
    elif exp < 190:
        return 170
    else:
        return 200
    
def get_max_intimacy(stat):
    if stat == 0:
        return 0
    elif stat < 8:
        return (stat + 1) * 5
    elif stat == 8:
        return 50
    elif stat == 9:
        return 70
    else:
        return 100

def get_fullness_increase(stat):
    if stat < 10:
        return 15 + 5 * stat
    else:
        return 70

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

        if interactType == "SHOWER":
            cleanness = min(maxValue, cleanness + 20)
            exp += 10                            
        elif interactType == "WALK":
            intimacy = min(maxValue + get_max_intimacy(intimacyStat), intimacy + 10)
            exp += 5
        elif interactType == "CHAT_POSITIVE":
            intimacy = min(maxValue + get_max_intimacy(intimacyStat), intimacy + 20)
            exp += 10
        elif interactType == "CHAT_NEGATIVE":
            intimacy = max(0, intimacy - 10)
        elif interactType == "EAT":
            fullness = min(maxValue, fullness + get_fullness_increase(fullnessStat))
            exp += 10
        else:
            raise ValueError(f"Invalid interactType : {interactType}")        

        characterInfo = {
            'exp': exp,
            'fullness': fullness,
            'intimacy': intimacy,
            'cleanness': cleanness
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