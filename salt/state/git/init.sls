git:
    pkg.installed

github.com:
    ssh_known_hosts:
        - present
        - user: bsdev
        - enc: ssh-rsa
        - key: /home/bsdev/.ssh/id_rsa.pub

git-website-prod:
    git.latest:
        - name: git@github.com:bigskytech/bsrs.git
        - rev: python3
        - target: /www/django/releases/persistent/bsrs/
        - identity: /home/bsdev/.ssh/id_rsa
        - require:
            - pkg: git
            - ssh_known_hosts: github.com
