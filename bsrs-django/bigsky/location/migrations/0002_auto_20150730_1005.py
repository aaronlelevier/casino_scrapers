# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='status',
            field=models.ForeignKey(related_name='locations', blank=True, to='location.LocationStatus', help_text=b"If not provided, will be the default 'LocationStatus'.", null=True),
        ),
        migrations.AlterField(
            model_name='location',
            name='type',
            field=models.ForeignKey(related_name='locations', blank=True, to='location.LocationType', null=True),
        ),
    ]
