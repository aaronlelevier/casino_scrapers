# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0008_auto_20150824_1626'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='location',
            name='status',
            field=models.ForeignKey(blank=True, to='location.LocationStatus', related_name='locations', help_text="If not provided, will be the default 'LocationStatus'.", null=True),
        ),
        migrations.AlterField(
            model_name='locationlevel',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='locationstatus',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='locationtype',
            name='deleted',
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
    ]
