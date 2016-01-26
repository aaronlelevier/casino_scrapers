# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-01-26 23:21
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_role_settings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='settings',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default={'create_all': {'required': True, 'type': 'bool', 'value': True}, 'dashboard_text': {'required': False, 'type': 'str', 'value': ''}, 'login_grace': {'required': True, 'type': 'int', 'value': 0}, 'modules': {'required': True, 'type': 'list', 'value': []}}),
        ),
    ]
