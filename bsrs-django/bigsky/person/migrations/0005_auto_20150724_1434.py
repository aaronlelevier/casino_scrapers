# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_auto_20150724_1430'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='person',
            managers=[
            ],
        ),
        migrations.AddField(
            model_name='person',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 24, 21, 33, 39, 864046, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='person',
            name='deleted',
            field=models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='person',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 24, 21, 34, 1, 119050, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
    ]
