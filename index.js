const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-ankit:@Lucifer610@cluster0-9sfix.mongodb.net/toDoListDB",{ useUnifiedTopology: true, useNewUrlParser: true});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true }));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  }
});

const customItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items:[itemSchema]
});

const CustomList = mongoose.model("list" , customItemSchema );

const Items = mongoose.model("item",itemSchema);

const item1 = new Items({
  item: "Welcome to your To-do-List"
});
const item2 = new Items({
  item: "Press + to add new item"
});
const item3 = new Items({
  item: "press <-- to delete an item"
});
var defaultItems = [item1,item2,item3];



const day = date.getDate();

app.get("/", function(req,res){
  console.log(req);
  Items.find({},function(err, foundItems) {
    if(foundItems.length === 0) {
      Items.insertMany([item1,item2,item3],function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("successfully added the items");
        }
        res.redirect("/");
      });
    } else {
      res.render('list',{listHeading : "Regular" , newItems : foundItems , type: "Regular"});
    }
  });
});
app.post("/", function(req,res){
  const newItem = new Items({
    item: req.body.listItem
  });
  if(req.body.add === "Regular"){
    newItem.save();
    res.redirect("/");
  } else {
    CustomList.findOne({name: req.body.add},function(err,foundOne){
      foundOne.items.push(newItem);
      foundOne.save();
    });
    res.redirect("/" + req.body.add);
  }

});
app.post("/delete",function(req, res) {
  if(req.body.listName === "Regular"){
    Items.deleteOne({_id : req.body.checked},function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    CustomList.findOneAndUpdate({name : req.body.listName},{ $pull : {items: {_id: req.body.checked}}},function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/" + req.body.listName);
  }

});
app.get("/:route", function(req,res) {
  const route = _.capitalize(req.params.route);
  CustomList.findOne({name: route},function(err,foundOne){
    if(!foundOne){
      const list = new CustomList({
        name: route,
        items: defaultItems
      });
      list.save();
      res.render('list',{listHeading: route, newItems: list.items, type: route});
    } else {
      res.render('list',{listHeading: route, newItems: foundOne.items, type: route});
    }

  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
  console.log("server started on port" + port);
});
