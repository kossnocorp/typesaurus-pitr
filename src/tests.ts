import { describe, expect, it, vi } from "vitest";
import * as admin from "firebase-admin";
import { groups, schema } from "typesaurus";
import { recover } from ".";
import { startOfHour, subHours } from "date-fns";

admin.initializeApp();

interface Model {
  time: Date;
  type: string;
  flag?: boolean;
}

const db = schema(($) => ({
  pitr: $.collection<Model>().sub({
    pitrSub: $.collection<Model>(),
  }),
}));

const rootId1 = db.pitr.id("test");
const subId11 = db.pitr.sub.pitrSub.id("test");
const subId12 = db.pitr.sub.pitrSub.id("test2");

const rootId2 = db.pitr.id("test2");
const subId21 = db.pitr.sub.pitrSub.id("test");
const subId22 = db.pitr.sub.pitrSub.id("test2");
const subId23 = db.pitr.sub.pitrSub.id("test3");

const rootId3 = db.pitr.id("test3");

const rootId4 = db.pitr.id("test4");

const pastTime = subHours(new Date(), 2);
const pastHour = startOfHour(pastTime);
const nowHour = startOfHour(new Date());

describe("recover", () => {
  it("allows to get documents", async () => {
    const sp = db.pitr.get(rootId1);
    const [past, now] = await Promise.all([recover(pastTime, sp), sp]);

    expect(nowHour).not.toEqual(pastHour);
    expect(past?.data.time).toEqual(pastHour);
    expect(now?.data.time).toEqual(nowHour);
  });

  it("allows to get all documents", async () => {
    const sp = db.pitr.all();
    const [past, now] = await Promise.all([recover(pastTime, sp), sp]);

    expect(nowHour).not.toEqual(pastHour);
    expect(past?.map((user) => user.data)).toEqual([
      expect.objectContaining({ type: "test", time: pastHour }),
      expect.objectContaining({ type: "test2", time: pastHour }),
      expect.objectContaining({ type: "test3", time: pastHour }),
      expect.objectContaining({ type: "test4", time: pastHour }),
    ]);
    expect(now?.map((user) => user.data)).toEqual([
      expect.objectContaining({ type: "test", time: nowHour }),
      expect.objectContaining({ type: "test2", time: nowHour }),
      expect.objectContaining({ type: "test3", time: nowHour }),
      expect.objectContaining({ type: "test4", time: nowHour }),
    ]);
  });

  it("allows to query documents", async () => {
    const sp = db.pitr.query(($) => $.field("flag").eq(true));
    const [past, now] = await Promise.all([recover(pastTime, sp), sp]);

    expect(nowHour).not.toEqual(pastHour);
    expect(past?.map((user) => user.data)).toEqual([
      expect.objectContaining({ type: "test2", time: pastHour, flag: true }),
      expect.objectContaining({ type: "test3", time: pastHour, flag: true }),
    ]);
    expect(now?.map((user) => user.data)).toEqual([
      expect.objectContaining({ type: "test2", time: nowHour, flag: true }),
      expect.objectContaining({ type: "test3", time: nowHour, flag: true }),
    ]);
  });

  it("allows to get many documents", async () => {
    const sp = db.pitr.many([rootId1, rootId4]);
    const [past, now] = await Promise.all([recover(pastTime, sp), sp]);

    expect(nowHour).not.toEqual(pastHour);
    expect(past?.map((user) => user?.data)).toEqual([
      expect.objectContaining({ type: "test", time: pastHour }),
      expect.objectContaining({ type: "test4", time: pastHour }),
    ]);
    expect(now?.map((user) => user?.data)).toEqual([
      expect.objectContaining({ type: "test", time: nowHour }),
      expect.objectContaining({ type: "test4", time: nowHour }),
    ]);
  });

  it("allows to query collection groups", async () => {
    const sp = groups(db).pitrSub.query(($) => $.field("flag").eq(true));
    const [past, now] = await Promise.all([recover(pastTime, sp), sp]);

    expect(nowHour).not.toEqual(pastHour);
    expect(past?.map((user) => user?.data)).toEqual([
      expect.objectContaining({ type: "test", time: pastHour, flag: true }),
      expect.objectContaining({ type: "test3", time: pastHour, flag: true }),
    ]);
    expect(now?.map((user) => user?.data)).toEqual([
      expect.objectContaining({ type: "test", time: nowHour, flag: true }),
      expect.objectContaining({ type: "test3", time: nowHour, flag: true }),
    ]);
  });

  it("allows to perform multiple requests", async () => {
    const allSP = db.pitr.all();
    const querySP = db.pitr.query(($) => $.field("flag").eq(true));
    const [pastAll, pastQuery] = await recover(pastTime, [allSP, querySP]);

    expect(pastAll?.map((user) => user.data)).toEqual([
      expect.objectContaining({ type: "test", time: pastHour }),
      expect.objectContaining({ type: "test2", time: pastHour }),
      expect.objectContaining({ type: "test3", time: pastHour }),
      expect.objectContaining({ type: "test4", time: pastHour }),
    ]);
    expect(pastQuery?.map((user) => user.data)).toEqual([
      expect.objectContaining({ type: "test2", time: pastHour, flag: true }),
      expect.objectContaining({ type: "test3", time: pastHour, flag: true }),
    ]);
  });
});
