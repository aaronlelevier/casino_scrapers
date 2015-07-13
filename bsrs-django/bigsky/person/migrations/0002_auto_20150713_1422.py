# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='personstatus',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 49, 17015), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personstatus',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='personstatus',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 52, 729010), auto_now=True),
            preserve_default=False,
        ),
    ]
