import express from "express";
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import crypto from "crypto";
import cors from "cors";
import multer from "multer";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const app = express();
const port = 3000;
const saltRounds = 10;
const upload = multer({ dest: "uploads/" });

await client.connect();
const database = client.db("classifieds");
const usersCollection = database.collection("users");
const categoriesCollection = database.collection("categories");
const adsCollection = database.collection("ads");
const commentsCollection = database.collection("comments");
const favoritesCollection = database.collection("favorites");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ---------- Vartotojai ----------

async function getUser(sessionId) {
  return await usersCollection.findOne({ sessionId: sessionId });
}

async function createUser(username, password, role) {
  try {
    const user = await usersCollection.findOne({ username: username });

    if (user) {
      return { success: false, reason: "user_exists", statusCode: 409 };
    }

    const sessionId = crypto.randomBytes(64).toString("hex");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await usersCollection.insertOne({
      username: username,
      password: hashedPassword,
      sessionId: sessionId,
      role: role,
      blocked: false,
    });

    return { success: true, sessionId: sessionId, role: role, statusCode: 201 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function login(username, password) {
  try {
    const user = await usersCollection.findOne({ username: username });

    if (user === null) {
      return { success: false, reason: "user_not_found", statusCode: 401 };
    }

    const didPass = await bcrypt.compare(password, user.password);

    if (!didPass) {
      return { success: false, reason: "wrong_password", statusCode: 401 };
    }
    if (user.blocked) {
      return { success: false, reason: "user_blocked", statusCode: 403 };
    }

    return { success: true, sessionId: user.sessionId, role: user.role, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// ---------- Kategorijos ----------

async function getCategories() {
  try {
    const categories = await categoriesCollection.find().toArray();
    return { success: true, data: categories, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function createCategory(sessionId, name) {
  try {
    const user = await getUser(sessionId);

    if (user === null || user.role !== "admin") {
      return { success: false, reason: "admin_only", statusCode: 403 };
    }

    await categoriesCollection.insertOne({ name: name });

    return { success: true, statusCode: 201 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// ---------- Skelbimai ----------

async function searchAds(categoryId, searchText) {
  try {
    const filter = { blocked: false };

    if (categoryId) {
      filter.categoryId = new ObjectId(categoryId);
    }
    if (searchText) {
      filter.$or = [
        { title: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
      ];
    }

    const ads = await adsCollection.find(filter).sort({ _id: -1 }).toArray();

    return { success: true, data: ads, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function getAd(adId) {
  try {
    const ad = await adsCollection.findOne({ _id: new ObjectId(adId), blocked: false });

    if (ad === null) {
      return { success: false, reason: "ad_not_found", statusCode: 404 };
    }

    return { success: true, data: ad, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function getMyAds(sessionId) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const ads = await adsCollection.find({ userId: user._id }).toArray();

    return { success: true, data: ads, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function createAd(sessionId, title, description, price, categoryId, image) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const newAd = await adsCollection.insertOne({
      title: title,
      description: description,
      price: Number(price),
      categoryId: new ObjectId(categoryId),
      image: image,
      userId: user._id,
      username: user.username,
      blocked: false,
    });

    return { success: true, adId: newAd.insertedId, statusCode: 201 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function updateAd(sessionId, adId, title, description, price, categoryId, image) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const ad = await adsCollection.findOne({ _id: new ObjectId(adId) });

    if (ad === null) {
      return { success: false, reason: "ad_not_found", statusCode: 404 };
    }
    if (!ad.userId.equals(user._id)) {
      return { success: false, reason: "not_your_ad", statusCode: 403 };
    }

    const changes = {
      title: title,
      description: description,
      price: Number(price),
      categoryId: new ObjectId(categoryId),
    };

    // Nuotrauka keičiama tik jei įkelta nauja
    if (image) {
      changes.image = image;
    }

    await adsCollection.updateOne({ _id: ad._id }, { $set: changes });

    return { success: true, reason: "updated_successfully", statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function deleteAd(sessionId, adId) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const ad = await adsCollection.findOne({ _id: new ObjectId(adId) });

    if (ad === null) {
      return { success: false, reason: "ad_not_found", statusCode: 404 };
    }
    if (!ad.userId.equals(user._id)) {
      return { success: false, reason: "not_your_ad", statusCode: 403 };
    }

    await adsCollection.deleteOne({ _id: ad._id });

    return { success: true, reason: "deleted_successfully", statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// ---------- Komentarai ----------

async function getComments(adId) {
  try {
    const comments = await commentsCollection
      .find({ adId: new ObjectId(adId), blocked: false })
      .toArray();

    return { success: true, data: comments, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

async function createComment(sessionId, adId, text) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    await commentsCollection.insertOne({
      adId: new ObjectId(adId),
      userId: user._id,
      username: user.username,
      text: text,
      blocked: false,
    });

    return { success: true, statusCode: 201 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// Ištrinti gali skelbimo savininkas arba administratorius
async function deleteComment(sessionId, commentId) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

    if (comment === null) {
      return { success: false, reason: "comment_not_found", statusCode: 404 };
    }

    const ad = await adsCollection.findOne({ _id: comment.adId });

    if (!ad.userId.equals(user._id) && user.role !== "admin") {
      return { success: false, reason: "not_your_ad", statusCode: 403 };
    }

    await commentsCollection.deleteOne({ _id: comment._id });

    return { success: true, reason: "deleted_successfully", statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// ---------- Patikę skelbimai ----------

async function getFavorites(sessionId) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const favorites = await favoritesCollection.find({ userId: user._id }).toArray();
    const adIds = favorites.map((favorite) => favorite.adId);

    const ads = await adsCollection.find({ _id: { $in: adIds }, blocked: false }).toArray();

    return { success: true, data: ads, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// Žvaigždutė: jei pažymėta - nuima, jei ne - pažymi
async function toggleFavorite(sessionId, adId) {
  try {
    const user = await getUser(sessionId);

    if (user === null) {
      return { success: false, reason: "sessionId_not_found", statusCode: 401 };
    }

    const favorite = await favoritesCollection.findOne({
      userId: user._id,
      adId: new ObjectId(adId),
    });

    if (favorite) {
      await favoritesCollection.deleteOne({ _id: favorite._id });
      return { success: true, favorite: false, statusCode: 200 };
    }

    await favoritesCollection.insertOne({ userId: user._id, adId: new ObjectId(adId) });

    return { success: true, favorite: true, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// ---------- Administratorius ----------

async function getUsers(sessionId) {
  try {
    const user = await getUser(sessionId);

    if (user === null || user.role !== "admin") {
      return { success: false, reason: "admin_only", statusCode: 403 };
    }

    const users = await usersCollection
      .find()
      .project({ password: 0, sessionId: 0 })
      .toArray();

    return { success: true, data: users, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// collection: usersCollection, adsCollection arba commentsCollection
async function setBlocked(sessionId, collection, id, blocked) {
  try {
    const user = await getUser(sessionId);

    if (user === null || user.role !== "admin") {
      return { success: false, reason: "admin_only", statusCode: 403 };
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { blocked: blocked } });

    return { success: true, blocked: blocked, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, reason: "server_error", statusCode: 500 };
  }
}

// ---------- Route'ai ----------

app.post("/api/register", async (req, res) => {
  if (req.body.username == undefined || req.body.password == undefined) {
    return res
      .status(400)
      .send({ success: false, reason: "no_username_or_password", statusCode: 400 });
  }

  const result = await createUser(req.body.username, req.body.password, "user");
  return res.status(result.statusCode).json(result);
});

app.post("/api/login", async (req, res) => {
  if (req.body.username == undefined || req.body.password == undefined) {
    return res
      .status(400)
      .send({ success: false, reason: "no_username_or_password", statusCode: 400 });
  }

  const result = await login(req.body.username, req.body.password);
  return res.status(result.statusCode).json(result);
});

app.get("/api/getCategories", async (req, res) => {
  const result = await getCategories();
  return res.status(result.statusCode).json(result);
});

app.post("/api/createCategory/:sessionId", async (req, res) => {
  if (req.body.name == undefined) {
    return res
      .status(400)
      .send({ success: false, reason: "give_all_parameters", statusCode: 400 });
  }

  const result = await createCategory(req.params.sessionId, req.body.name);
  return res.status(result.statusCode).json(result);
});

// /api/searchAds?category=<id>&q=<frazė>
app.get("/api/searchAds", async (req, res) => {
  const result = await searchAds(req.query.category, req.query.q);
  return res.status(result.statusCode).json(result);
});

app.get("/api/getAd/:adId", async (req, res) => {
  const result = await getAd(req.params.adId);
  return res.status(result.statusCode).json(result);
});

app.get("/api/getMyAds/:sessionId", async (req, res) => {
  const result = await getMyAds(req.params.sessionId);
  return res.status(result.statusCode).json(result);
});

// multipart/form-data: title, description, price, categoryId, image
app.post("/api/createAd/:sessionId", upload.single("image"), async (req, res) => {
  const { title, description, price, categoryId } = req.body;

  if (
    title == undefined ||
    description == undefined ||
    price == undefined ||
    categoryId == undefined ||
    req.file == undefined
  ) {
    return res
      .status(400)
      .send({ success: false, reason: "give_all_parameters", statusCode: 400 });
  }

  const result = await createAd(
    req.params.sessionId,
    title,
    description,
    price,
    categoryId,
    req.file.filename,
  );
  return res.status(result.statusCode).json(result);
});

// Tie patys laukai kaip createAd, image neprivalomas
app.put("/api/updateAd/:sessionId/:adId", upload.single("image"), async (req, res) => {
  const { title, description, price, categoryId } = req.body;

  if (
    title == undefined ||
    description == undefined ||
    price == undefined ||
    categoryId == undefined
  ) {
    return res
      .status(400)
      .send({ success: false, reason: "give_all_parameters", statusCode: 400 });
  }

  const result = await updateAd(
    req.params.sessionId,
    req.params.adId,
    title,
    description,
    price,
    categoryId,
    req.file?.filename,
  );
  return res.status(result.statusCode).json(result);
});

app.delete("/api/deleteAd/:sessionId/:adId", async (req, res) => {
  const result = await deleteAd(req.params.sessionId, req.params.adId);
  return res.status(result.statusCode).json(result);
});

app.get("/api/getComments/:adId", async (req, res) => {
  const result = await getComments(req.params.adId);
  return res.status(result.statusCode).json(result);
});

app.post("/api/createComment/:sessionId/:adId", async (req, res) => {
  if (req.body.text == undefined) {
    return res
      .status(400)
      .send({ success: false, reason: "give_all_parameters", statusCode: 400 });
  }

  const result = await createComment(req.params.sessionId, req.params.adId, req.body.text);
  return res.status(result.statusCode).json(result);
});

app.delete("/api/deleteComment/:sessionId/:commentId", async (req, res) => {
  const result = await deleteComment(req.params.sessionId, req.params.commentId);
  return res.status(result.statusCode).json(result);
});

app.get("/api/getFavorites/:sessionId", async (req, res) => {
  const result = await getFavorites(req.params.sessionId);
  return res.status(result.statusCode).json(result);
});

app.post("/api/toggleFavorite/:sessionId/:adId", async (req, res) => {
  const result = await toggleFavorite(req.params.sessionId, req.params.adId);
  return res.status(result.statusCode).json(result);
});

app.get("/api/admin/getUsers/:sessionId", async (req, res) => {
  const result = await getUsers(req.params.sessionId);
  return res.status(result.statusCode).json(result);
});

// body: { "blocked": true } arba { "blocked": false }
app.patch("/api/admin/blockUser/:sessionId/:userId", async (req, res) => {
  const result = await setBlocked(
    req.params.sessionId,
    usersCollection,
    req.params.userId,
    req.body.blocked,
  );
  return res.status(result.statusCode).json(result);
});

app.patch("/api/admin/blockAd/:sessionId/:adId", async (req, res) => {
  const result = await setBlocked(
    req.params.sessionId,
    adsCollection,
    req.params.adId,
    req.body.blocked,
  );
  return res.status(result.statusCode).json(result);
});

app.patch("/api/admin/blockComment/:sessionId/:commentId", async (req, res) => {
  const result = await setBlocked(
    req.params.sessionId,
    commentsCollection,
    req.params.commentId,
    req.body.blocked,
  );
  return res.status(result.statusCode).json(result);
});

const admin = await usersCollection.findOne({ role: "admin" });
if (admin === null) {
  await createUser("admin", "admin123", "admin");
  console.log("Sukurtas administratorius: admin / admin123");
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
