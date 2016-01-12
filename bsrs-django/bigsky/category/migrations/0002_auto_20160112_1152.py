# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-12 19:52
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='level',
            field=models.IntegerField(blank=True, default=0, help_text='A count of how many parent categories that this Category has.'),
        ),
    ]
