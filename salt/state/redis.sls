include:
  - redis

redis:
  service.running:
    - enable: True
    - reload: True
