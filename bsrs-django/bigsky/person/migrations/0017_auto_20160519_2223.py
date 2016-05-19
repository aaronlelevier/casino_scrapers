# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-19 22:23
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0016_auto_20160518_0102'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='settings',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='setting.Setting'),
        ),
        migrations.AlterField(
            model_name='role',
            name='settings',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='setting.Setting'),
        ),
    ]
