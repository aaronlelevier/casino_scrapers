# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0004_auto_20150708_1455'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationlevel',
            name='name',
            field=models.CharField(unique=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='locationstatus',
            name='name',
            field=models.CharField(unique=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='locationtype',
            name='name',
            field=models.CharField(unique=True, max_length=100),
        ),
    ]
