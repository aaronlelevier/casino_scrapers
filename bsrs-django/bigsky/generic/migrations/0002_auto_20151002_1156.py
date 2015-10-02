# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('generic', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='savedsearch',
            name='person',
            field=models.ForeignKey(help_text=b'The Person who saves the search.', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='mainsetting',
            name='content_type',
            field=models.ForeignKey(to='contenttypes.ContentType'),
        ),
        migrations.AddField(
            model_name='customsetting',
            name='content_type',
            field=models.ForeignKey(to='contenttypes.ContentType'),
        ),
    ]
