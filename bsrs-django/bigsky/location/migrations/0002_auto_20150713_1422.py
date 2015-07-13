# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationlevel',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 39, 889187), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='locationlevel',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 41, 337405), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationstatus',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 42, 697419), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationstatus',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='locationstatus',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 44, 449252), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationtype',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 45, 873117), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationtype',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='locationtype',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 47, 505233), auto_now=True),
            preserve_default=False,
        ),
    ]
