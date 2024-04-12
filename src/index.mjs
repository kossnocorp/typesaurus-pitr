import { Timestamp } from "firebase-admin/firestore";
import {
  dbSymbol,
  nativeSymbol,
  pathToDoc,
  wrapData,
} from "typesaurus/adapter/admin/core";
import { firestoreSymbol } from "typesaurus/adapter/admin/firebase";

export function recover(time, sp) {
  const db = sp.request[dbSymbol];
  const firestore = db[firestoreSymbol]();

  // Floor the minute to avoid Firestore complaining
  const time_ = new Date(time);
  time_.setSeconds(0, 0);

  return firestore
    .runTransaction((transaction) => unwrapRequest(transaction, sp.request), {
      readOnly: true,
      readTime: Timestamp.fromDate(time_),
    })
    .then((result) => wrapResult(sp.request, result));
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
