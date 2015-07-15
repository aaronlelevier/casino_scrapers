git:
    pkg.installed

git-website-prod:
    git.latest:
        - name: git@github.com:bigskytech/bsrs.git
        - rev: master
        - target: /opt/django
        - identity: /root/.ssh/id_rsa
        - require:
            - pkg: git
