const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const utils = require('./utils');

const database = {};

database.createAnkiDeck = (inputVideo, inputSubs) => {
  dbFile = `output/${utils.quickName(inputVideo)}.db`;
  let exists = fs.statSync(dbFile).isFile();
  const db = new sqlite.Database(dbFile);

  _createDB(db);

  _insertColValues(db, utils.quickName(inputVideo));

};

const _createDB = (db) => {
  db.serialize(() => {
    // Create all tables
    createTables.forEach(createCmd => db.run(createCmd));
    // Create indices
    createIndices.forEach(createCmd => db.run(createCmd));
  });
};

const createTables = [
  createCol,
  createCards,
  createGraves,
  createNotes,
  createRevlog
];

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

const _insertColValues = (db, quickName) => {
  const arbitraryTime = Date.now();

  db.serialize(() => {
    db.run('INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) VALUES (?)', colValues.join(', '))
  });

  const colValues = {
    id: 0,
    crt: arbitraryTime,
    mod: arbitraryTime,
    scm: arbitraryTime,
    ver: 1,
    dty: 0,
    usn: 0,
    ls: 0,
    conf,
    models,
    decks: ,
    dconf: ,
    tags: 
  };

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

  const models = JSON.stringify({
    `${arbitraryTime}`: 
      {
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
            bafmt: ,
            afmt: "{{FrontSide}}\n\n<hr id=answer/>\n\n{{Back}}",
            ord: 0,
            bqfmt: ''
          }
        ],
        type: 0,
        usn: -1,
        vers: 0
      }
  });

  const decks = JSON.stringify([
    {
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
      revToday: "two number array used somehow for custom study", 
      lrnToday: "two number array used somehow for custom study", 
      id: "deck ID (automatically generated long)", 
      mod: "last modification time", 
      desc: "deck description"
    }
  ]);


};

const colColumns = [
  
];

module.exports database;
