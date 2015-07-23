# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0006_auto_20150723_1353'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 23, 21, 10, 6, 290350, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='person',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 23, 21, 10, 12, 65924, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='name',
            field=models.CharField(max_length=100, blank=True),
        ),
    ]
