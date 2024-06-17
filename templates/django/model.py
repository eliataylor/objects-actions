class __CLASSNAME__(SuperModel):
    class Meta:
        abstract = False

    ###FIELDS_OVERRIDE###

    ###SAVE_OVERRIDE###
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = slugify(self.title)
        super().save(*args, **kwargs)

class __CLASSNAME__Admin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(__CLASSNAME__, __CLASSNAME__Admin)