class __CLASSNAME__(AbstractUser, BumpParentsModelMixin):
    class Meta:
        verbose_name = __SINGULAR__
        verbose_name_plural = __PLURAL__
        ordering = ['last_login']

###METHODS###

###FIELDS_OVERRIDE###

    def __str__(self):
        if self.get_full_name().strip():
            return self.get_full_name()
        elif self.get_short_name().strip():
            return self.get_short_name()
        elif self.username.strip():
            return self.username
        else:
            return str(self.id) # never expose the email

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def add_email_address(self, request, new_email):
        # Add a new email address for the user, and send email confirmation.
        # Old email will remain the primary until the new one is confirmed.
        return EmailAddress.objects.add_email(request, request.user, new_email, confirm=True)


    @receiver(email_confirmed)
    def update_user_email(sender, request, email_address, **kwargs):
        # Once the email address is confirmed, make new email_address primary.
        # This also sets user.email to the new email address.
        # email_address is an instance of allauth.account.models.EmailAddress
        email_address.set_as_primary()
        # Get rid of old email addresses
        EmailAddress.objects.filter(user=email_address.user).exclude(primary=True).delete()

