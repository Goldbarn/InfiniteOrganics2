from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
import os

import sqlite3

conn = sqlite3.connect('TCMdatabase.db', check_same_thread=False)

cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS type (
    prevType1 TEXT,
    prevType2 TEXT,
    resultType TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS moves (
    prevType1 TEXT NOT NULL,
    prevMove1 TEXT NOT NULL,
    prevType2 TEXT NOT NULL,
    prevMove2 TEXT NOT NULL,
    resultType3 TEXT NOT NULL,
    resultMove3 TEXT NOT NULL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS creature (
    prevType1 TEXT NOT NULL,
    prevCreature1 TEXT NOT NULL,
    prevType2 TEXT NOT NULL,
    prevCreature2 TEXT NOT NULL,
    resultType3 TEXT NOT NULL,
    resultCreature3 TEXT NOT NULL
)
''')

app = Flask(__name__)
CORS(app)

def getAPIKey():
    try:
        with open('Put-Google-Gemini-API-Key-Here.txt', 'r') as file:
            return file.read().strip()
    except Exception as e:
        return str(e)

def combineTypes(type1, type2):
    
    cursor.execute('''
    SELECT resultType
    FROM type
    WHERE (? IN (prevType1, prevType2)) AND (? IN (prevType1, prevType2))
    ''', (type1, type2))

    result = cursor.fetchone()
    if result:
        resultType_value = result[0]
        return resultType_value
    else:
        try:
            client = genai.Client(api_key=getAPIKey())
            response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Fill in the blank with a one or two word answer and say nothing else. The conceptual elements {type1} combined with {type2} creates blank."
            )
            newResultType = response.text.strip()
            cursor.execute('''
            INSERT INTO type (prevType1, prevType2, resultType)
            VALUES(?,?,?)
            ''', (type1, type2, newResultType))
            conn.commit
            return newResultType
        except Exception as e:
            return str(e)

def genMonster(types):
    try:
        client = genai.Client(api_key=getAPIKey())
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Make up a creature, or entity of the following types (only generate a single creature or entity, to which all of the types apply): " + types + ". Give it a description of a few sentences. Do not give list its name, only a description."
        )
        return response.text.strip()
    except Exception as e:
        return str(e)

def genNameStats(description):
    try:
        client = genai.Client(api_key=getAPIKey())
        
        # Log the description being sent to the API
        print(f"Sending description to API: {description}")
        
        # Generate name
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Description: " + description + " Based on this description of this creature, what would its name be? Answer only with its name and say nothing else, not even punctuation."
        )
        monName = response.text.strip()
        print(f"API Response (Name): {monName}")
        
        # Generate max HP
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Description: " + description + " Based on this description of this creature, what would its max HP be if it were in a video game? Give only an integer and say nothing else, not even punctuation."
        )
        maxHP = response.text.strip()
        print(f"API Response (Max HP): {maxHP}")
        
        # Generate attack
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Description: " + description + " Based on this description of this creature, what would its attack stat be if it were in a video game? Give only an integer and say nothing else, not even punctuation."
        )
        attack = response.text.strip()
        print(f"API Response (Attack): {attack}")
        
        # Generate defense
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Description: " + description + " Based on this description of this creature, what would its defense stat be if it were in a video game? Give only an integer and say nothing else, not even punctuation."
        )
        defense = response.text.strip()
        print(f"API Response (Defense): {defense}")
        
        # Generate speed
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Description: " + description + " Based on this description of this creature, what would its speed stat be if it were in a video game? Give only an integer and say nothing else, not even punctuation."
        )
        speed = response.text.strip()
        print(f"API Response (Speed): {speed}")
        
        return {
            "name": monName,
            "maxHP": maxHP,
            "attack": attack,
            "defense": defense,
            "speed": speed
        }
    except Exception as e:
        print(f"Error in genNameStats: {e}")
        return str(e)

def calcMult(atkType, defTypes):
    try:
        client = genai.Client(api_key=getAPIKey())
        
        # Log the description being sent to the API
        print(f"Sending attack type and defender types to API: {atkType}, {defTypes}")
        
        # Generate effectiveness percentage
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Suppose an attack of type {atkType} is used against a monster of types {', '.join(defTypes)}. Determine what percentage of a normal attack's effectiveness it would have. For example, a normal attack has 100% effectiveness. The percentage can be as big as 1000000% or as low as 0%. Say the percentage number without the percent symbol, and say nothing else."
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error in calcMult: {e}")
        return "100"  # Default to 100% if there's an error
    
conn.close

@app.route('/')
def serve_index():
    return send_from_directory('templates', 'index.html')

@app.route('/index.html')
def serve_thing():
    return send_from_directory('templates', 'index.html')

@app.route('/monsters.html')
def serve_monsters():
    return send_from_directory('templates', 'monsters.html')

@app.route('/fight.html')
def serve_fight():
    return send_from_directory('templates', 'fight.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/process', methods=['POST'])
def process_input():
    data = request.get_json()
    return jsonify({'result': combineTypes(data['input1'], data['input2'])})

@app.route('/genMonster', methods=['POST'])
def genMonsterInput():
    data = request.get_json()
    return jsonify({'result': genMonster(data['types'])})

@app.route('/calcMult', methods=['POST'])
def calcMultInput():
    data = request.get_json()
    atkType = data.get('atkType')
    defTypes = data.get('defTypes')
    result = calcMult(atkType, defTypes)
    return jsonify({'result': result})

@app.route('/genNameStats', methods=['POST'])
def genNameStatsInput():
    data = request.get_json()
    return jsonify({'result': genNameStats(data['monsterDesc'])})

if __name__ == '__main__':
    app.run(ssl_context=('cert.pem', 'key.pem'), port=5000)
