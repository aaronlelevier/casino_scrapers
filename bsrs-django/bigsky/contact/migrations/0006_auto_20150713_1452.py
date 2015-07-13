# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0005_auto_20150713_1449'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationaddress',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 45, 32588, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationaddress',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='locationaddress',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 51, 744273, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationemail',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 53, 56179, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationemail',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='locationemail',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 54, 520326, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationphonenumber',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 56, 96173, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locationphonenumber',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='locationphonenumber',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 57, 464127, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personaddress',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 51, 59, 208146, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personaddress',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='personaddress',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 52, 0, 520161, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personemail',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 52, 2, 40152, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personemail',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='personemail',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 52, 3, 400069, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personphonenumber',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 52, 8, 671802, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='personphonenumber',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='personphonenumber',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 13, 21, 52, 14, 799749, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
    ]
