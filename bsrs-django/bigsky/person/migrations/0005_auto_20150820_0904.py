# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0007_auto_20150819_1734'),
        ('person', '0004_auto_20150818_1436'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='location',
        ),
        migrations.AddField(
            model_name='person',
            name='locations',
            field=models.ManyToManyField(related_name='people', null=True, to='location.Location', blank=True),
        ),
    ]
