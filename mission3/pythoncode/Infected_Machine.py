import time, requests

def executeSomething():
    # Maybe edit
    response = requests.get('http://10.4.17.30')
    # print response
    headers = response.headers
    dateStr = headers['Date']

    # GMT is changed to GNT to avoid being triggered by real normal requests
    # Read the 6 values before GNT

    ccCheck = dateStr[26:30]

    if ccCheck == 'GNT': 
        command = dateStr[17:25]
        comPick = { 
            '12:12:12': "DDoS Attack", 
            '11:12:12': "Overflow Attack", 
        }
        if command in comPick: 
            print(comPick[command])
        else:
            print('Error: Command not found')

    time.sleep(10)

while True:
    executeSomething()
