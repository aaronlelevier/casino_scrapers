# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0003_auto_20150721_1704'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='status',
            field=models.ForeignKey(blank=True, to='person.PersonStatus', null=True),
        ),
    ]
