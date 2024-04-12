import { schema } from "typesaurus";
import { groups } from "typesaurus/groups";
import { recover } from ".";

interface User {
  name: string;
  age: number;
}

interface Post {
  title: string;
  text: string;
}

const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
}));

//! It allows to get documents
async function get() {
  const user = await recover(
    //! It acccepts dates
    new Date(),
    db.users.get(db.users.id("123"))
  );
  if (user) {
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  }
}

//! It allows to get all documents
async function all() {
  const users = await recover(
    //! It acccepts string
    new Date().toISOString(),
    db.users.all()
  );
  users.forEach((user) => {
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  });
}

//! It allows to query documents
async function query() {
  const users = await recover(
    //! It acccepts numbers
    Date.now(),
    db.users.query(($) => $.field("age").gte(18))
  );
  users.forEach((user) => {
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  });
}

//! It allows to get many documents
async function many() {
  const users = await recover(
    new Date(),
    db.users.many([db.users.id("123"), db.users.id("456")])
  );
  users.forEach((user) => {
    if (!user) return;
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  });
}

//! It allows to query collection groups
async function collectionGroups() {
  const users = await recover(
    new Date(),
    groups(db).users.query(($) => $.field("age").gt(18))
  );
  users.forEach((user) => {
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  });
}

//! It allows to send multiple requests
async function array() {
  const [user, users] = await recover(new Date(), [
    db.users.get(db.users.id("123")),
    db.users.all(),
  ]);

  if (user) {
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  }

  users.forEach((user) => {
    //! The data must of User
    user.data.name;
    // @ts-expect-error
    user.data.nope;
  });
}
