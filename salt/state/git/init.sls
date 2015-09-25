git:
    pkg.installed

github.com:
    ssh_known_hosts:
        - present
        - user: bsdev
        - fingerprint: 2e:15:f2:4a:7e:b0:db:ab:89:10:ba:b6:b1:6c:9f:c0

git-website-prod:
    git.latest:
        - name: git@github.com:bigskytech/bsrs.git
        - rev: python3
        - target: /www/django/releases/persistent/bsrs/
        - identity: /home/bsdev/.ssh/id_rsa
        - require:
            - pkg: git
            - ssh_known_hosts: github.com
