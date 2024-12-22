# Composer/SatisPress - Github Org Mirror

What this does. I have multiple wordpress sites that use satispress to generate a separate composer repository for each group of paid private plugins. This repository allows me to aggragate all of those repositories into a single composer repostiory that can be used to install all of the plugins from a single repository.

# How it works
This repo is designed to be used as the root repository for a github organization. It can be a free org, and this is designed to maintain the secrets required to run the repository. (I.E. the VaultPass {encrypting and decrypting satispress un/pw }, and the github PAT token used to push updates to the private repos). In this example, the org is called `ydtb-wp` and the repository is called `ydtb-wp.github.io`. This is so that the composer repository can be accessed at `https://ydtb-wp.github.io` and the composer packages.json can be accessed at `https://ydtb-wp.github.io/packages.json`. If you are setting this up for your org, you will need to replace `ydtb-wp` with your org name.

## Updating composer

We can now add the following to our composer.json file for the site we are working on:
```json
    "repositories": [
        {
            "type": "composer",
            "url": "https://wpackagist.org",
            "only": [
                "wpackagist-plugin/*",
                "wpackagist-theme/*"
            ]
        },
        {
            "type": "composer",
            "url": "https://ydtb-wp.github.io/"
        }
    ]
```
I am using trellis to deploy my wordpress sites, so I have added the github credentials to the site vault. [Composer HTTP Basic Authentication](https://roots.io/trellis/docs/composer-http-basic-authentication/)

## ENV Variables
locally, you will need to create a `.env` file in the root of the repository. This file should contain the following variables:

```
VAULT_PASS=your-vault-pass #used to encrypt/decrypt the satispress username/password
PAT=your-github-pat #used to push updates to the private repositories
ORG=ydtb-wp #the name of the github org that this repository is in
REPO=ydtb-wp.github.io #the name of the repository that this is in
```

Under the github repository settings, you will need to add the following secrets:

```
VAULT_PASS=your-vault-pass #used to encrypt/decrypt the satispress username/password
PAT=your-github-pat #used to push updates to the private repositories
```
Note: the org and the repo are not needed as secrets, as they are already available to the actions.

## Executables
in the `.\bin` folder are several scripts that are used to setup, update, or check for plugin updates. 
most of the scripts are designed to be run from your local machine interactively, as they will prompt you for the required information. The updatePackages.ts script can be run locally, but is also designed to be run as a github action. Currently it's set to run every 8 hours, but you can change that to whatever you want in the `.github/workflows/check-for-updates.yml` file.

* **addSource.ts** - This script will add a new satispress website/repository to the `./data/sources.json` file. It will prompt you for the required information, and then add the new source to the file. The usernames and passwords are encrypted so that they are not stored in plain text.
* **chooseRepos.ts** - This will fetch the list of plugins that all of the satispress repositories are tracking, and then prompt you to choose which ones you want to track in this repository. It will then update the `./data/packages.json` file with the selected plugins.
* **encryptSource.ts** - This will encrypt the username and password for a satispress repository. It will use the `VAULT_PASS` environment variable to encrypt the username and password, and then update the `./data/sources.json` file with the encrypted values.
* **decryptSource.ts** - This will decrypt the username and password for a satispress repository. It will use the `VAULT_PASS` environment variable to decrypt the username and password, and then update the `./data/sources.json` file with the decrypted values.
* **updatePackages.ts** - This is the main function that checks for new plugins and stores those tags as new versions in repos in the org. It then updates the `./data/packages.json` file with the new versions of the plugins. This file is then pushed to the repository, and the `build-deploy.yml` action is run to update the composer packages.json file with the new versions of the plugins. In this org the packages.json file is available at `https://ydtb-wp.github.io/packages.json`

This can be run locally, but it is intended that this is run as a github action. 

## Github Actions

### build-deploy.yml
Anytime you push to the repository, the `build-deploy.yml` action will be run. It takes the information from the `./data/packages.json` file and generates the composer `packages.json` file that is downloaded and used by composer to install the plugins. 

### check-for-updates.yml
This action is run every 8 hours. It will check the multiple satispress repositories for any updates to the plugins that are tracked with the respective satispress repositories, and if there are any, it will download the zip file for that tag, unzip's it into the repo that is tracking that specific plugin. If a repo does not yet exist, one will be created in the org. After it successfully merges the unzipped plugin into the repository the repo is tagged with the tag version and the `./data/packages.json` is updated to reflect that the new version is available. When that is pushed to the repository, the `build-deploy.yml` action will be run automatically and the `packages.json` file will be updated with the new version of the plugin.

# Work in Progress
This is a work in progress, and I am still working on the documentation and the scripts. I will update this as I make progress. If you have any questions, feel free to open an issue and I will do my best to help you out.