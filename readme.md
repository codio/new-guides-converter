# Convert guides version 1 to 2

## Version 1

All guide content was saved as one ```.guides/sections.md``` file. As the result: the collaboration was broken.

## Version 2

Every section has it content in a separate file located in ```.guides/content/``` folder. Other section properties and order is defined in the ```.guides/metadata.json``` file.

# Converter

to start conversion run in the terminal:

```
    curl https://bitbucket.org/codio/new-guides-converter/raw/master/build/converter.js | node
```

this will download the latest version of convert guides in your workspace directory

*CODIO_PROJECT_PATH* environment variable is used to specify path to codio project if it differs from the default ```/home/coio/workspace```

# Build

```
   npm run build
```

# Deploy

```
   npm run build
```

commit changes and push the new version of script to the repo.

Joel please fix mistakes. Thank you.