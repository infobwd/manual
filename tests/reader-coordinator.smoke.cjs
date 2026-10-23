const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const window = {};
vm.runInNewContext(fs.readFileSync("assets/reader-coordinator.js","utf8"),{window});
let shelf=0, feature=0, opens=0, listener;
const coordinator=window.WD_READER_COORDINATOR.createReaderCoordinator({
  experience:{subscribeBooks(fn){listener=fn}},
  renderShelf(){shelf++}, renderContinueFeature(){feature++}, openBook(){opens++}
});
coordinator.connect();
assert.equal(shelf,1); assert.equal(feature,1);
listener(); assert.equal(shelf,2); assert.equal(feature,2);
assert.equal(coordinator.openReadable({status:"draft",pages:[1]}),false);
assert.equal(coordinator.openReadable({status:"published",pages:[]}),false);
assert.equal(coordinator.openReadable({status:"published",pages:[1]}),true);
assert.equal(opens,1);
console.log("PASS Reader coordinator");
