# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-13 19:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0018_auto_20160524_2346'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='auth_amount',
            field=models.DecimalField(blank=True, decimal_places=4, default=0, max_digits=15, null=True),
        ),
    ]
