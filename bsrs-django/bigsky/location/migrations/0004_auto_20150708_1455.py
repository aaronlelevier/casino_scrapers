# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0003_auto_20150708_1455'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationlevel',
            name='children',
            field=models.ManyToManyField(related_name='parents', to='location.LocationLevel', blank=True),
        ),
    ]
