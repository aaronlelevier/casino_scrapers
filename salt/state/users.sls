{% for user in pillar.get('users', {}) %}
{{user}}:
  user.present:
    - groups:
      - {{user}}
{% endfor %}
