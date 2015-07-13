# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20150713_1422'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 53, 39, 805369, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='location',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='location',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 53, 41, 237028, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
    ]
