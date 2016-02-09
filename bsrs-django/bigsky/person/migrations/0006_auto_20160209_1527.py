# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-02-09 23:27
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20160126_1521'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='settings',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default={'create_all': {'inherited': False, 'required': True, 'type': 'bool', 'value': True}, 'login_grace': {'inherited': False, 'required': True, 'type': 'int', 'value': 0}, 'modules': {'inherited': False, 'required': True, 'type': 'list', 'value': []}, 'welcome_text': {'inherited': False, 'required': False, 'type': 'str', 'value': ''}}),
        ),
    ]
