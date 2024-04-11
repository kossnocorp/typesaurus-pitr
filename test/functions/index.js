const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { startOfHour } = require("date-fns");
const functions = require("firebase-functions/v1");

initializeApp();

exports.preparePITR = functions.pubsub.schedule("0 * * * *").onRun(async () => {
  await getFirestore()
    .collection("pitr")
    .doc("test")
    .set({ time: Timestamp.fromDate(startOfHour(Date.now())) });
});
