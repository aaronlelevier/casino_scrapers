# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workorder',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='workorderstatus',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
    ]
