//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "Check the box to remove an item"
});

const defaultItem = [item1, item2, item3];
//Item.insertMany(defaultItem);

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  async function f() {
    const items = await Item.find({});
    if(items.length===0) Item.insertMany(defaultItem);
    res.render("list", {listTitle: "Today", newListItems: items});
  };
  f();
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  
  async function f() {
    const foundList = await List.findOne({ name: customListName }, "name items");
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: customListName, newListItems: foundList.items })
    }
  }
  f();
});

app.post("/", function(req, res){
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  if (itemName != "") {
    if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    f();
    async function f() {
      const foundList = await List.findOne({ name: listName }, "name items");
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
  }
  } else {
    if (listName === "Today") {
      res.redirect("/");
    } else {
      res.redirect("/" + listName);
    }
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    async function run() {
      await Item.deleteOne({_id:checkedItemId});
    }
    run();
    res.redirect("/");
  } else {
    f();
    async function f() {
      let foundList = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
      res.redirect("/" + listName);
    }
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, async function() {
  console.log("Server started on port 3000");
  await mongoose.connect("mongodb+srv://narendra-maurya:test1234@cluster0.2p53s5l.mongodb.net/todolistDB", { useNewUrlParser: true });
  console.log("Database connected!!")
});
