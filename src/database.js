const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const utils = require('./utils');
const apkgCreater = require('./archiver');
const chalk = require('chalk');

const database = {};

database.createAnkiDeck = (inputVideo, inputSubs) => {
  dbFile = `./pkg/collection.anki2`;
  console.log('Creating db file...');

  const fileDescriptor = fs.openSync(dbFile, 'w');

  const db = new sqlite.Database(dbFile);

  // Print out executed statements and execution duration in mSecs
  db.on('profile', (query, execDuration) => {
    console.log(`${query.slice(0, 20).trim()}... [ ${execDuration}ms ]`);
  });
  db.on('error', err => {throw err;});

  _createDB(db);

  const arbitraryTime = Date.now();
  _insertColValues(db, utils.quickName(inputVideo), arbitraryTime);

  // Returns function that will be called with the database file reference and collection 'quickname' when the db is closed
  return (callback) => {
    db.close(() => {
      fs.closeSync(fileDescriptor);
      callback(dbFile, utils.quickName(inputVideo));
    });
  };
};

const _createDB = (db) => {

  db.serialize(() => {
    // Create all tables
    createTables.forEach(createCmd => db.run(createCmd));
    // Create indices
    createIndices.forEach(createCmd => db.run(createCmd));
  });
};

const createCol = `
  CREATE TABLE col (
    id        integer primary key,
    crt       integer not null,
    mod       integer not null,
    scm       integer not null,
    ver       integer not null,
    dty       integer not null,
    usn       integer not null,
    ls        integer not null,
    conf      text not null,
    models    text not null,
    decks     text not null,
    dconf     text not null,
    tags      text not null
  );
`;

const createCards = `
  CREATE TABLE cards (
    id       integer primary key,
    nid      integer not null,
    did      integer not null,
    ord      integer not null,
    mod      integer not null,
    usn      integer not null,
    type     integer not null,
    queue    integer not null,
    due      integer not null,
    ivl      integer not null,
    factor   integer not null,
    reps     integer not null,
    lapses   integer not null,
    left     integer not null,
    odue     integer not null,
    odid     integer not null,
    flags    integer not null,
    data     text not null
  );
`;

const createGraves = `
  CREATE TABLE graves (
    usn     integer not null,
    oid     integer not null,
    type    integer not null
  );
`;

const createNotes = `
  CREATE TABLE notes (
    id      integer primary key,
    guid    text not null,
    mid     integer not null,
    mod     integer not null,
    usn     integer not null,
    tags    text not null,
    flds    text not null,
    sfld    text not null,
    csum    integer not null,
    flags   integer not null,
    data    text not null
  );
`;

const createRevlog = `
  CREATE TABLE revlog (
    id      integer primary key,
    cid     integer not null,
    usn     integer not null,
    ease    integer not null,
    ivl     integer not null,
    lastIvl integer not null,
    factor  integer not null,
    time    integer not null,
    type    integer not null
  );
`;

const createIndices = [
  'CREATE INDEX ix_cards_nid on cards (nid);',
  'CREATE INDEX ix_cards_sched on cards (did, queue, due);',
  'CREATE INDEX ix_cards_usn on cards (usn);',
  'CREATE INDEX ix_notes_csum on notes (csum);',
  'CREATE INDEX ix_notes_usn on notes (usn);',
  'CREATE INDEX ix_revlog_cid on revlog (cid);',
  'CREATE INDEX ix_revlog_usn on revlog (usn);'
];

const createTables = [
  createCol,
  createCards,
  createGraves,
  createNotes,
  createRevlog
];

const _insertColValues = (db, quickName, arbitraryTime) => {

  const conf = JSON.stringify({
    nextPos: 1,
    estTimes: true,
    activeDecks: [1],
    sortType: 'noteFld',
    timeLim: 0,
    sortBackwards: false,
    addToCur: true,
    curDeck: 1,
    newBury: true,
    newSpread: 0,
    dueCounts: true,
    curModel: `${arbitraryTime}`,
    collapseTime: 1200
  });

  const models = {};
  models[`${arbitraryTime}`] = {
    css: '',
    did : arbitraryTime,
    flds: [
      {
        font: 'Arial',
        media: [],
        name: 'Media',
        ord: 0,
        rtl: false,
        size: 12,
        sticky: false
      },
      {
        font: 'Arial',
        media: [],
        name: 'Text',
        ord: 0,
        rtl: false,
        size: 12,
        sticky: false
      }
    ],
    id: arbitraryTime,
    latexPost: "\\\\end{document}", // added two extra `\`
    latexPre: "\\\\documentclass[12pt]{article}\n\\\\special{papersize=3in,5in}\n\\\\usepackage{amssymb,amsmath}\n\\\\pagestyle{empty}\n\\\\setlength{\\\\parindent}{0in}\n\\\\begin{document}\n",
    mod: arbitraryTime, // This is string in ex...
    name: "Media Generated Cards",
    req: [], // Array of arrays, ie:  `[[0, "any", [0, 3, 6]]],`
    sortf: 1, // was 0
    tags: [], // empty array
    tmpls: [
      {
        name: 'Forward',
        qfmt: '{{Media}}',
        did: null,
        bafmt: '',
        afmt: "{{FrontSide}}\n\n<hr />\n\n<div id='answer'>{{Text}}</div>",
        ord: 0,
        bqfmt: ''
      }
    ],
    type: 0,
    usn: 0,
    vers: [] // empty array []
  };

  const decks = {};
  decks['1'] = {
    name: 'Default',
    extendRev: 50,
    usn: 0, // was `arbitraryTime`
    collapsed: false,
    browserCollapsed: false,
    newToday: [0, 0],
    timeToday: [0, 0],
    dyn: 0,
    extendNew: 10,
    conf: 1,
    revToday: [0, 0],
    lrnToday: [0, 0],
    id: 1,
    mod: 1425168760, // was `arbitraryTime`
    desc: ""
  };

  decks[`${arbitraryTime}`] = {
    name: quickName,
    extendRev: 1000,
    usn: 0, // was `arbitraryTime`
    collapsed: false,
    browserCollapsed: true, // was false
    newToday: [10, 0],
    timeToday: [10, 0],
    dyn: 0,
    extendNew: 1000,
    conf: 1,
    revToday: [10, 0],
    lrnToday: [10, 0],
    id: arbitraryTime,
    mid: `${arbitraryTime}`, // was not included
    mod: arbitraryTime,
    desc: `Automatically generated deck for ${quickName}`
  };

  const dconf = {
    "1":{
       "name": "Default",
       "replayq": true,
       "lapse": 
        {
          "leechFails":8,
          "minInt":1,
          "delays":[10],
          "leechAction":0,
          "mult":0
         },
       "rev":
         {
          "perDay":100,
          "fuzz":0.05,
          "ivlFct":1,
          "maxIvl":36500,
          "ease4":1.3,
          "bury":true,
          "minSpace":1
         },
       "timer":0,
       "maxTaken":60,
       "usn":0,
       "new":{
          "perDay":20,
          "delays":[1, 10],
          "separate":true,
          "ints":[1, 4, 7],
          "initialFactor":2500,
          "bury":true,
          "order":1
       },
       "mod":0,
       "id":1,
       "autoplay":true
    }
  };

  const colValues = {
    $id: 0,
    $crt: arbitraryTime,
    $mod: arbitraryTime,
    $scm: arbitraryTime,
    $ver: 11,
    $dty: 0,
    $usn: 0,
    $ls: 0,
    $conf: conf,
    $models: JSON.stringify(models),
    $decks: JSON.stringify(decks),
    $dconf: JSON.stringify(dconf),
    $tags: "{}" // was just ''
  };

  db.serialize(() => {
    db.run('INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) VALUES ($id, $crt, $mod, $scm, $ver, $dty, $usn, $ls, $conf, $models, $decks, $dconf, $tags)', colValues);
  });
};

module.exports = database;