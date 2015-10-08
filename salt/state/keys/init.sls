/home/bsdev/.ssh/id_rsa.pub:
    file.managed:
        - source: salt://keys/id_rsa.pub
        - user: bsdev
        - group: bsdev
        - mode: 0400

/home/bsdev/.ssh/id_rsa:
    file.managed:
        - source: salt://keys/id_rsa
        - user: bsdev
        - group: bsdev
        - mode: 0400