import subprocess
import time
from scapy.all import *

# read passwords
with open('hostnames.txt', 'r') as fp:
    for cnt, url in enumerate(fp):
        command = "dig @10.4.17.30 " + url
        print(command)
        subprocess.Popen([command], shell=True)
        time.sleep(1)
