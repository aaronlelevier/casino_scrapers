rabbitmq-server:
  pkg.installed:
    - name: rabbitmq-server

  service:
    - running
    - enable: True
    - reload: True
    - watch:
      - pkg: rabbitmq-server