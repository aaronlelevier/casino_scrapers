# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('util', '0002_auto_20150708_1233'),
    ]

    operations = [
        migrations.AlterField(
            model_name='setting',
            name='settings',
            field=models.TextField(help_text=b'JSON Dict saved as a string in DB', blank=True),
        ),
    ]
