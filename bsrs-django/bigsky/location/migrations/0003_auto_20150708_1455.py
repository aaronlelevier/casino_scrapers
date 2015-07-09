# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20150708_1026'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationlevel',
            name='children',
            field=models.ManyToManyField(related_name='parents', null=True, to='location.LocationLevel', blank=True),
        ),
    ]
