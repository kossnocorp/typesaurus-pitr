import { Timestamp } from "firebase-admin/firestore";
import {
  dbSymbol,
  nativeSymbol,
  pathToDoc,
  wrapData,
} from "typesaurus/adapter/admin/core";
import { firestoreSymbol } from "typesaurus/adapter/admin/firebase";

export async function recover(time, sps) {
  // Floor the minute to avoid Firestore complaining
  const time_ = new Date(time);
  time_.setSeconds(0, 0);
  const transactionOptions = {
    readOnly: true,
    readTime: Timestamp.fromDate(time_),
  };

  // Each subscription promise can belong to a different database, make sure
  // they are grouped correctly
  const firestores = {};
  const firestoreToSPSPairs = {};
  [].concat(sps).forEach((sp, index) => {
    const db = sp.request[dbSymbol];
    const firestore = db[firestoreSymbol]();
    const firestoreId = firestore._databaseId;
    firestores[firestoreId] = firestore;
    (firestoreToSPSPairs[firestoreId] ||= []).push([sp, index]);
  });

  // Collect results using a transaction for each database instance
  const results = [];
  await Promise.all(
    Object.entries(firestoreToSPSPairs).map(([firestoreId, spPairs]) =>
      firestores[firestoreId].runTransaction(
        (transaction) =>
          Promise.all(
            spPairs.map(([sp, index]) =>
              unwrapRequest(transaction, sp.request).then(
                (result) => (results[index] = wrapResult(sp.request, result))
              )
            )
          ),
        transactionOptions
      )
    )
  );

  // Return single result if the argument was a single subscription promise
  return Array.isArray(sps) ? results : results[0];
}

function unwrapRequest(transaction, request) {
  const native = request[nativeSymbol];
  if (request.kind === "many") {
    return Promise.all(native.map((ref) => transaction.get(ref)));
  }
  return transaction.get(native);
}

function wrapResult(request, result) {
  const db = request[dbSymbol];
  const wrap = (doc) => pathToDoc(db, doc.ref.path, wrapData(db, doc.data()));

  switch (request.kind) {
    case "get":
      return wrap(result);

    case "all":
    case "query":
      return result.docs.map(wrap);

    case "many":
      return result.map(wrap);
  }
}
