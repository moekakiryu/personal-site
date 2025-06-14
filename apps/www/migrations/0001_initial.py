# Generated by Django 5.1.6 on 2025-02-26 16:26

import django.db.models.deletion
import tinymce.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BlogEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('content', tinymce.models.HTMLField()),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_url', models.URLField()),
                ('title', models.CharField(max_length=255)),
                ('blurb', models.TextField(max_length=120)),
                ('writeup', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='www.blogentry')),
            ],
        ),
    ]
