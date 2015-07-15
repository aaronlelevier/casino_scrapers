git:
    pkg.installed

git-website-prod:
    git.latest:
        - name: git@github.com:bigskytech/bsrs.git
        - rev: master
        - target: /opt/django
        - require:
            - pkg: git
