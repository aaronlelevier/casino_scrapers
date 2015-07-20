# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150720_1452'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='status',
            field=models.ForeignKey(to='person.PersonStatus'),
        ),
    ]
