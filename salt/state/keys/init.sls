/home/tomcat/.ssh/id_rsa.pub:
    file.managed:
        - source: salt://keys/id_rsa.pub
        - user: tomcat
        - group: tomcat
        - mode: 0400

/home/tomcat/.ssh/id_rsa:
    file.managed:
        - source: salt://keys/id_rsa
        - user: tomcat
        - group: tomcat
        - mode: 0400