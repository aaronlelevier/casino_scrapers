# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('ticket', '0001_initial'),
        ('generic', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='savedsearch',
            name='person',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, help_text='The Person who saves the search.'),
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
        migrations.AddField(
            model_name='attachment',
            name='ticket',
            field=models.ForeignKey(to='ticket.Ticket', blank=True, related_name='attachments', null=True),
        ),
    ]
