//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saso:Badreiq666@cluster0.ld4icgl.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Wake-up early",
});
const item2 = new Item({
  name: "Morning routine",
});
const item3 = new Item({
  name: "Get ready",
});

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
/* Item.insertMany(defaultItems)
  .then(function () {
    console.log("Data inserted"); // Success
  })
  .catch(function (error) {
    console.log(error); // Failure
  }); */

app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Data inserted"); // Success
        })
        .catch(function (error) {
          console.log(error); // Failure
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", async function (req, res) {
  try {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
      Item.findByIdAndDelete(checkedItemId)
        .then(function (items) {
          console.log("Deleted : ", items);
        })
        .catch(function (error) {
          console.log(error); // Failure
        });
      res.redirect("/");
    } else {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listName);
    }
  } catch (error) {
    console.error(error);
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.error("Error occurred:", err);
    });

  //res.send(req.params.listName)
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
