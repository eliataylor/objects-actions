### Create your Drupal CMS and API from your Object-Actions worksheet

<details>
<summary>Click here if you first need help setting up a PHP or MySQL</summary>

* **Use Docker!** (https://www.drupal.org/docs/develop/local-server-setup/docker-based-development-environments-for-macos-linux-and-windows)
* If you can't here are [other options](https://www.drupal.org/docs/develop/local-server-setup) 
</details>


<details>
<summary>Click here if you need help getting a Drupal instance running</summary>

* **Install Composer** if you don't have it already (https://getcomposer.org/doc/00-intro.md#installation-linux-unix-macos)
  * `php composer-setup.php --install-dir=bin --filename=composer`
  * `mv composer.phar /usr/local/bin/composer`
* **Load Drupal** `composer create-project drupal/recommended-project my_site_name_dir`
* **Create a database** Ideally just use your IDE, but here's a command line option: (https://www.drupal.org/docs/getting-started/installing-drupal/create-a-database)
* **Run the installer** by visiting your site in a browser (url based on your environment setup above
* **Status check** by visiting {{host}}/admin/reports/status
</details>
