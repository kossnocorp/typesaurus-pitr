const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { startOfHour } = require("date-fns");
const functions = require("firebase-functions/v1");

initializeApp();

exports.preparePITR = functions.pubsub.schedule("0 * * * *").onRun(async () => {
  const db = getFirestore();
  const coll = db.collection("pitr");
  const subColl = db.collection("pitr/test/pitrSub");
  const sub2Coll = db.collection("pitr/test2/pitrSub");

  const time = Timestamp.fromDate(startOfHour(Date.now()));

  await Promise.all([
    coll.doc("test").set({
      type: "test",
      time,
    }),

    subColl.doc("test").set({
      type: "test",
      time: Timestamp.fromDate(startOfHour(Date.now())),
      flag: true,
    }),

    subColl.doc("test2").set({
      type: "test2",
      time,
    }),

    coll.doc("test2").set({
      type: "test2",
      time,
      flag: true,
    }),

    sub2Coll.doc("test").set({
      type: "test",
      time,
    }),

    sub2Coll.doc("test2").set({
      type: "test2",
      time,
    }),

    sub2Coll.doc("test3").set({
      type: "test3",
      time,
      flag: true,
    }),

    coll.doc("test3").set({
      type: "test3",
      time,
      flag: true,
    }),

    coll.doc("test4").set({
      type: "test4",
      time,
    }),
  ]);
});
