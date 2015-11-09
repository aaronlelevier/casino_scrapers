/var/www/persistent:
  file.directory:
    - user: tomcat
    - group: tomcat
    - makedirs: True
    - recurse:
      - user
      - group
