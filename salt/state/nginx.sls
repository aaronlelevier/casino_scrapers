nginx:
  # Install Nginx
  pkg:
    - installed
    - name: nginx
  # Ensure Nginx is always running.
  service:
    - running
    - enable: True
    - name: nginx
    - require:
      - pkg: nginx
