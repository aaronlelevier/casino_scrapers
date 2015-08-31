# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0003_auto_20150818_1436'),
    ]

    operations = [
        migrations.DeleteModel(
            name='State',
        ),
    ]
