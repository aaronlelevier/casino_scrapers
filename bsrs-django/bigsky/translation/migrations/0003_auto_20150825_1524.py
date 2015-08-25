# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0002_auto_20150825_1518'),
    ]

    operations = [
        migrations.AlterField(
            model_name='translation',
            name='language',
            field=models.OneToOneField(to='translation.Locale'),
        ),
    ]
