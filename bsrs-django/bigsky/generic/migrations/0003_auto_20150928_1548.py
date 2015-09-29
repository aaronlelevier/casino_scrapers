# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0002_customsetting_mainsetting_savedsearch'),
    ]

    operations = [
        migrations.AlterField(
            model_name='savedsearch',
            name='name',
            field=models.CharField(help_text=b'name of the saved search that the Person designates.', max_length=254),
        ),
    ]
