# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-13 22:49
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('routing', '0002_auto_20160713_2116'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='profilefilter',
            options={'ordering': ['id']},
        ),
    ]