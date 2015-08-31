# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0009_country_state'),
    ]

    operations = [
        migrations.AlterField(
            model_name='country',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='location',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='location',
            name='status',
            field=models.ForeignKey(null=True, to='location.LocationStatus', blank=True, related_name='locations', help_text="If not provided, will be the default 'LocationStatus'."),
        ),
        migrations.AlterField(
            model_name='locationlevel',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='locationstatus',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='locationtype',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='state',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
    ]
