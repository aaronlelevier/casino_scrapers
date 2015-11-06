#top.sls
base:
  '*':
    - nginx
    - postgres
