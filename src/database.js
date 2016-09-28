const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const utils = require('./utils');

const database = {};

database.createAnkiDeck = (inputVideo, inputSubs) => {
  dbFile = `./${utils.quickName(inputVideo)}.db`;
  // let exists = fs.statSync(dbFile).isFile();
  console.log('Creating db file...');
  fs.openSync(dbFile, 'w');

  const db = new sqlite.Database(dbFile);

  _createDB(db);

  const arbitraryTime = Date.now();
  _insertColValues(db, utils.quickName(inputVideo), arbitraryTime);

  db.close();

  return db;
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
    curModel: arbitraryTime,
    collapseTime: 1200
  });

  const models = {};
  models[arbitraryTime] = {
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
    latexPost: "\\end{document}",
    latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
    mod: arbitraryTime,
    name: "Media Generated Cards",
    req: [],
    sortf: 0,
    tags: '',
    tmpls: [
      {
        name: 'Forward',
        qfmt: '{{Front}}',
        did: null,
        bafmt: '',
        afmt: "{{FrontSide}}\n\n<hr id=answer/>\n\n{{Back}}",
        ord: 0,
        bqfmt: ''
      }
    ],
    type: 0,
    usn: -1,
    vers: 0
  };

  const decks = {};
  decks['1'] = {
    name: 'Default',
    extendRev: 50,
    usn: arbitraryTime,
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
    mod: arbitraryTime,
    desc: ""
  };

  decks[`${arbitraryTime}`] = {
    name: quickName,
    extendRev: 1000,
    usn: arbitraryTime,
    collapsed: false,
    browserCollapsed: false,
    newToday: [10, 0],
    timeToday: [10, 0],
    dyn: 0,
    extendNew: 1000,
    conf: 1,
    revToday: [10, 0],
    lrnToday: [10, 0],
    id: arbitraryTime,
    mod: arbitraryTime,
    desc: `Automatically generated deck for ${quickName}`
  };

  const dconf = {
    "1":{
       "name":"Default",
       "replayq":true,
       "lapse":{
          "leechFails":8,
          "minInt":1,
          "delays":[
             10
          ],
          "leechAction":0,
          "mult":0
       },
       "rev":{
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
          "delays":[
             1,
             10
          ],
          "separate":true,
          "ints":[
             1,
             4,
             7
          ],
          "initialFactor":2500,
          "bury":true,
          "order":1
       },
       "mod":0,
       "id":1,
       "autoplay":true
    }
  };

  const colValues = [
    0,                       // id
    arbitraryTime,           // crt
    arbitraryTime,           // mod
    arbitraryTime,           // scm
    1,                       // ver
    0,                       // dty
    0,                       // usn
    0,                       // ls
    conf,                    // conf
    JSON.stringify(models),  // models
    JSON.stringify(decks),   // decks
    dconf,                   // dconf
    ""                       // tags
  ];

  db.serialize(() => {
    db.run('INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) VALUES (?)', colValues.join(', '))
  });
};

module.exports = database;
