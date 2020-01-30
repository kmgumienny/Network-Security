import subprocess
import sys
import socket
import select
import ipaddress
from scapy.all import *
from netfilterqueue import NetfilterQueue
from threading import Thread, Lock
from datetime import datetime
import urllib.request

thread_mysql_sniffer = None
thread_http_proxy = None

mutex = Lock()
src_ips = []
threads = []

threshold = 8
domain_names = {}


def thread_http_nfqueue(packet):
    if interrupted:
        packet.accept()
        return
    # converts raw packet into scapy compatible string
    ip_p = IP(packet.get_payload())
    src_ip = ip_p[IP].src
    orig_dest_ip = ip_p[IP].dst
    if ipaddress.ip_address(src_ip) in ipaddress.ip_network('10.4.17.64/26'):
        req = urllib.request.Request('http://' + orig_dest_ip)
        res = urllib.request.urlopen(req)
        dateHeader = (res.info().get('Date'))
        print(dateHeader)
        if dateHeader.index('GNT'):
            print("WARNING: Malicious Date Header")
            print("Packet Dropped...")
            res.close()
            packet.drop()
        else:
            packet.accept()
        
    

if __name__ == "__main__":
    ips_mode = False
    interrupted = False
    if len(sys.argv) > 1:
        if sys.argv[1] == 'ips':
            ips_mode = True
            print("Running as IPS")

    nf_queue2 = NetfilterQueue()
    nf_queue2.bind(2, thread_http_nfqueue)
    try:
        print('Waiting for data')
        nf_queue2.run()
    except KeyboardInterrupt:
        interrupted = True
        nf_queue2.unbind()
