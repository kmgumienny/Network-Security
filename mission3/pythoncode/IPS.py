import subprocess
import sys
import socket
import select
import ipaddress
from scapy.all import *
from netfilterqueue import NetfilterQueue
from threading import Thread, Lock
from datetime import datetime

thread_mysql_sniffer = None
thread_http_proxy = None

mutex = Lock()
src_ips = []
threads = []

threshold = 8
domain_names = {}


def thread_dns_nfqueue(packet):
    if interrupted:
        packet.accept()
        return
    # converts raw packet into scapy compatible string
    ip_p = IP(packet.get_payload())
    src_ip = ip_p[IP].src
    orig_dest_ip = ip_p[IP].dst

    if ip_p.haslayer(DNSRR):
        packet.accept()
    # store request info (host name and domain name)
    elif ip_p.haslayer(DNSQR) and ipaddress.ip_address(src_ip) in ipaddress.ip_network('10.4.17.64/26'):
        query = ip_p[DNSQR].qname.decode("utf-8")
        query_split = query.split(".")

        print(query)

        if ips_mode:
            host_name = query_split[0]
            domain_name = ""

            for s in query_split:
                if s == host_name:
                    continue
                domain_name = domain_name + "." + s

            if not domain_name in domain_names:
                domain_names[domain_name] = []
            if not host_name in domain_names[domain_name]:
                domain_names[domain_name].append(host_name)

            # check if number of unique hostnames is over theshold
            if len(domain_names[domain_name]) > threshold:
                print("\n---Suspicious Activity Detected---")
                print("Domain name " + domain_name + " has " + str(len(domain_names[domain_name])) + " unique host names\n")
                # return because we dont want the DNS request to go through
                packet.drop()
            else:
                packet.accept()
        else:
            packet.accept()
    else:
        packet.accept()



def thread_http_nfqueue(packet):
    if interrupted:
        packet.accept()
        return
    # converts raw packet into scapy compatible string
    ip_p = IP(packet.get_payload())
    src_ip = ip_p[IP].src
    orig_dest_ip = ip_p[IP].dst
    print("Source IP: " + src_ip)
    packet.accept()



if __name__ == "__main__":
    ips_mode = False
    interrupted = False
    if len(sys.argv) > 1:
        if sys.argv[1] == 'ips':
            ips_mode = True
            print("Running as IPS")

    nf_queue = NetfilterQueue()
    nf_queue2 = NetfilterQueue()
    #nf_queue.bind(1, thread_dns_nfqueue)
    nf_queue2.bind(2, thread_http_nfqueue)
    try:
        print('Waiting for data')
        #nf_queue.run()
        nf_queue2.run()
    except KeyboardInterrupt:
        interrupted = True
        #nf_queue.unbind()
        nf_queue2.unbind()
