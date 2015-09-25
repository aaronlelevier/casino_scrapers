include:
    - git

update-salt-states:
    cmd.run:
        - name: cp -r /www/django/releases/persistent/bsrs/salt/state/* /srv/salt
        - require:
            - sls: git