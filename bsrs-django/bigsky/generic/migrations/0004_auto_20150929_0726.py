# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0003_auto_20150928_1548'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='savedsearch',
            options={'ordering': ('-modified',), 'verbose_name_plural': 'Saved Searches'},
        ),
        migrations.RenameField(
            model_name='savedsearch',
            old_name='endpoint',
            new_name='endpoint_uri',
        ),
        migrations.RemoveField(
            model_name='savedsearch',
            name='model_id',
        ),
        migrations.AddField(
            model_name='savedsearch',
            name='endpoint_name',
            field=models.CharField(default='admin.people.index', help_text=b"the Ember List API route name. i.e. 'admin.people.index'.", max_length=254),
            preserve_default=False,
        ),
    ]
