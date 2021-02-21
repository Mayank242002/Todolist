const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

const lodash = require("lodash");

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://Mayank-Singh-Negi:test123@cluster0.g5r5n.mongodb.net/todolistDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to our to do list",
});

const item2 = new Item({
  name: "Click the + icon to add new item",
});

const item3 = new Item({
  name: "<- click this icon to delete the item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTittle: "Today", newlistitems: items });
    }
  });
});

app.get("/:routeName", function (req, res) {
  const routeName = lodash.capitalize(req.params.routeName);

  List.findOne({ name: routeName }, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      if (results) {
        //show existing list

        res.render("list", {
          listTittle: results.name,
          newlistitems: results.items,
        });
      } else {
        //creating new list

        const list = new List({
          name: routeName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + routeName);
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newitem;

  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundItem) {
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const deleteitemid = req.body.checkbox;

  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(deleteitemid, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName }, //condition
      { $pull: { items: { _id: deleteitemid } } }, //update
      function (err, results) {
        if (!err) {
          res.redirect("/" + listName);
        }
      } //calback
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
