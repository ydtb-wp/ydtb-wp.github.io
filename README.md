# ydtb-wp.github.io

This is the GitHub Workflow Repository for storing paid plugins the Your Digital Toolbox WordPress site. 

In developing websites for people I have used Trellis for a number of years, and have found it to be a great tool for managing WordPress sites. The one component that has always seemed to be a thorn in my side is the paid plugins. Everyone has a different way of managing how to get their updates onto the site, and managing all of that can be a bit of a pain. PHP composer makes it beautiflly simple to manage public plugins, and I wanted to extend that to paid plugins as well.

Here's how it works, Plugins get added to and activated on the wordpress sites that they will be used on. We add the license key to the site, and then they will be notified when a new update for the plugin is available. This information is stored in a WordPress Transient, and we can read that information to see if there are any updates available. If there are updates available, The plugin will send a post request to a workflow action in this repository. The action will then download the new plugin update, and Add it to a private repository for that plugin. Then the workflow action will regenerate the packages.json file, and redeploy the github page with the new plugin version. When composer checks for updates on the site, it will see that there is a new version available, and will download and install the new version of the plugin.

This allows us to manage paid plugins in the same way that we manage public plugins, and makes it easy to keep everything up to date automatically.

## How to use ##

This is a work in progress, and I will be adding more documentation as I go, as well as some youtube videos explaining how to set this up for your own Agency. 

This is mainly for my own use, but if you would like to use it, you can fork this repository and modify the workflow to work with your own plugins. 

There are three parts to this process, the first is the WordPress Plugin, and the second is this GitHub Workflow & Pages, finally the third part is the composer.json file of your trellis project.

- `Plugin Token`
    To be able to kick off a workflow action and pass it data, a github token with those rights is needed. You can create a new token in your github account settings. This token will be provided to your website plugin, and will be used to send the post request to the workflow action when there is an update available.

- `Internal Admin`
    The workflow action will be reading and writing to many different repositories. Personally I created a free organization for all of the wordpress plugins that I use, and the internal Access token will need rights to be able to read and write to that organization. This token will be stored in the repository secrets, and will be used by the workflow action to download the new plugin update, and add it to the private repository. This way private plugins can stay private, but composer on your website can still access the public information about what plugins are available.

- `Composer`
    Finally the auth.json file of your composer project will be updated such that composer can access the private repository that the plugin updates are stored in. This will allow composer to download the new plugin updates and install them on the site.+