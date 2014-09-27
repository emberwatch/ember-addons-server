var EmberAddons = require('./lib/ember_addons'),
    Repository = require('./lib/db'),
    dotenv = require('dotenv'),
    RSVP = require('rsvp');

// load vars
dotenv.load();

// Init
var repo = new Repository(process.env.DATABASE_URL);
var emaddons = new EmberAddons();

// Update addons
console.log('--> Fetching data from npm registry...');
emaddons.fetchAllWithDetailsAndDownloads()
  .then(function(results) {
    console.log('--> Done fetching data.');

    var promises = results.map(function(item) {
      return repo.createOrReplace({
        name: item.name,
        description: item.description,
        time: item.time,
        homepage: item.homepage,
        keywords: item.keywords,
        repository: item.repository,
        author: item.author,
        bugs: item.bugs,
        license: item.license,
        readmeFilename: item.readmeFilename,
        github: item.github,
        _npmUser: item._npmUser,
        starred: item.starred,
        downloads: item.downloads
      });
    });

    console.log('--> Writing to db...');
    return RSVP.all(promises);
  })
  .then(function(results) {
    console.log('--> Done updating %s addons.', results.length);
    console.log('--> Saving metrics...');
    return repo.saveMetric('total', results.length);
  })
  .then(function() {
    console.log('--> Finished.');
    repo.db.close();
  });
