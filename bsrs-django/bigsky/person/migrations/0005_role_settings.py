# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-07 00:53
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='role',
            name='settings',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default={}),
        ),
    ]
