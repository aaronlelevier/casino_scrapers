# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0003_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workorder',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='workorderstatus',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
    ]
