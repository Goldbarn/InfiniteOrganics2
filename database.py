import sqlite3

conn = sqlite3.connect('TCMdatabase.db')

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

string1 = 'string 1'
string2 = 'string 2'
cursor.execute("INSERT INTO type (prevType1, prevType2) VALUES (?, ?)",(string1, string2))
conn.commit()

cursor.execute('''
SELECT resultType
FROM type
WHERE (? IN (prevType1, prevType2)) AND (? IN (prevType1, prevType2))
''', (string1, string2))

result = cursor.fetchone()

if result:
    resultType_value = result[0]
    print(f"found string. value of result Type : {resultType_value}")
else:
    print("Strings not found, putting in table")
    cursor.execute('''
INSERT INTO type (prevType1, prevType2, resultType)
VALUES(?,?,?)
''', (string1, string2, "new_val"))
    
conn.commit()

cursor.execute("SELECT * FROM type")
rows = cursor.fetchall()
for row in rows:
    print(row)




conn.close()

