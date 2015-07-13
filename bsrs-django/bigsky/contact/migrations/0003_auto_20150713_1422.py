# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_auto_20150713_1201'),
    ]

    operations = [
        migrations.AddField(
            model_name='addresstype',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 29, 801825), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='addresstype',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='addresstype',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 32, 537593), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='emailtype',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 34, 385629), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='emailtype',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='emailtype',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 35, 721567), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='phonenumbertype',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 37, 177322), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='phonenumbertype',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='phonenumbertype',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 14, 22, 38, 529521), auto_now=True),
            preserve_default=False,
        ),
    ]
