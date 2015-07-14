# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='location',
        ),
        migrations.AddField(
            model_name='person',
            name='location',
            field=models.ForeignKey(default=1, to='location.Location'),
            preserve_default=False,
        ),
    ]
