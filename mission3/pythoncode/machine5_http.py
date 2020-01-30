import time, requests

def executeSomething():
    # Maybe edit
    response = requests.get('http://10.4.17.40')
    time.sleep(5)

while True:
    executeSomething()
