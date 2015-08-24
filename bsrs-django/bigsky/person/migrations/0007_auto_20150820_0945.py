# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0006_auto_20150820_0907'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='locations',
            field=models.ManyToManyField(related_name='people', to='location.Location', blank=True),
        ),
    ]
