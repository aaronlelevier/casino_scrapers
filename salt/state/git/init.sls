include:
- keys

git:
    pkg.installed

github.com:
    ssh_known_hosts:
        - present
        - user: root
        - fingerprint: 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48

git-website-prod:
    git.latest:
        - name: git@github.com:bigskytech/bsrs.git
        - rev: master
        - target: /opt/django
        - identity: /root/.ssh/id_rsa
        - require:
            - sls: keys
            - pkg: git
            - ssh_known_hosts: github.org