const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const query = `
  SELECT posts.*, authors.name AS author_name FROM posts 
  INNER JOIN authors ON posts.authorId = authors.id
  `;
  const [posts] = await db.query(query);

  let order = req.query.order;

  let nextOrder = "desc";

  if (order !== "asc" && order !== "desc") {
    order = "asc";
  }

  if (order === "desc") {
    nextOrder = "asc";
  }
  let writtenOrder;

  posts.sort(function (resA, resB) {
    if (
      (order === "asc" && resA.title > resB.title) ||
      (order === "desc" && resB.title > resA.title)
    ) {
      writtenOrder = "Z-A";
      return 1;
    } else {
      writtenOrder = "A-Z";
      return -1;
    }
  });
  res.render("posts-list", {
    posts: posts,
    nextOrder: nextOrder,
    writtenOrder: writtenOrder,
  });
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts (title, summary, body, authorId) VALUES (?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const query = `
    SELECT posts.*,authors.name AS author_name,authors.email AS author_email FROM posts 
    INNER JOIN authors on posts.authorId = authors.id
    WHERE posts.id=?
    `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function (req, res) {
  const query = `
    SELECT * FROM posts WHERE id =?
    `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit", async function (req, res) {
  const query = `
    UPDATE posts SET title = ?,
    summary = ?,
    body = ?
    WHERE id = ?
    `;
  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);

  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);

  res.redirect("/posts");
});

module.exports = router;

module.exports = router;
