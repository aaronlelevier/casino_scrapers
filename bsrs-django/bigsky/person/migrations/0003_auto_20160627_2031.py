# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-27 20:31
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20160623_2309'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='role',
            name='default_accept_assign',
        ),
        migrations.RemoveField(
            model_name='role',
            name='default_accept_notify',
        ),
    ]