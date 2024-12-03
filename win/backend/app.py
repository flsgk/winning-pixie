import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # CORS 허용

# 크롤링 함수
def fetch_schedule(team, year=None, month=None):

    today = datetime(2024, 4, 1)
    year = year or today.year
    month = month or today.month
        
        
    url = f"https://statiz.sporki.com/schedule/?year={year}&month={month}"
    
    # HTTP 요청 및 인코딩 자동 처리
    response = requests.get(url)
    
    print(f"Response Status Code: {response.status_code}")
    
    # 서버가 제공한 인코딩을 그대로 사용
    response.encoding = response.apparent_encoding  # 자동으로 인코딩 감지
    
    if response.status_code != 200:
        return {"error": "웹 페이지를 불러오는 데 실패했습니다."}
    
    # BeautifulSoup 사용 시 html.parser 파서 사용
    soup = BeautifulSoup(response.text, 'html.parser')

    games = []
    
    for td in soup.find_all("td"):
        games_div = td.find("div", class_="games")
        if games_div:
            for game_item in games_div.find_all("li"):
                game_info = game_item.find("a")
                
                # 날짜 추출
                day_span = td.find("span", class_="day")
                if day_span:
                    day = day_span.get_text().strip()
                else:
                    day = "N/A"
                
                # 팀 정보 추출
                teams = game_item.find_all("span", class_="team")
                scores = game_item.find_all("span", class_="score")
                
                if len(teams) == 2 and len(scores) == 2:
                    # 유니코드 이스케이프를 하지 않음, 한글 텍스트를 그대로 추출
                    team1_name = teams[0].text.strip()
                    team2_name = teams[1].text.strip()
                    score1 = scores[0].text.strip()
                    score2 = scores[1].text.strip()

                    # 선택된 팀의 일정만 필터링
                    if team in [team1_name, team2_name]:
                        game = {
                            "date": day,  # 날짜만 표시
                            "team1": team1_name,
                            "score1": score1,
                            "team2": team2_name,
                            "score2": score2
                        }
                        games.append(game)
    
    # 크롤링된 데이터를 터미널에 출력
    print(f"Crawled Games: {games}")
    
    return games

# API 엔드포인트 정의
@app.route('/api/schedule', methods=['GET'])
def schedule():
    year = request.args.get('year')
    team = request.args.get('team')
    month = request.args.get('month')
    
    if not year or not team or not month:
        return jsonify({"error": "연도, 팀, 월을 모두 제공해야 합니다."}), 400
    
    # 크롤링하여 일정 가져오기
    games = fetch_schedule(team, year, month)
    
    if "error" in games:
        return jsonify(games), 500
    
    # 정상적으로 일정 반환
    return jsonify(games)

if __name__ == '__main__':
    app.run(debug=True, port=5001)