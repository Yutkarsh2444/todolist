const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));;

app.use(express.static("public"));

const itemsSchema = {
    name: String
};
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Welcome to do todolist!"
});
// const item2 = new Item({
//     name: "Hit the + button to add the new item."
// });
// const item3 = new Item({
//     name: ",-- Hit this is to delete the item."
// });

// const defaultItems = [item1, item2, item3];
const defaultItems = [item1];
 
const listSchema = {
    name :String,
    items : [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
    var today = new Date();
    var currday = today.getDay();
    var options = {
        weekday:"long",
        day:"numeric",
        month:"long"
    }
    var day = today.toLocaleDateString("en-us",options)
    Item.find({})
        .then(function (foundItems) {
            if (foundItems.length == 0) {
                Item.insertMany(defaultItems)
                    .then(function () {
                        console.log("Successfully saved defult items to DB");

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                res.redirect("/");

            }
            else {

                res.render("list", { listTitle: day, newItem:foundItems });
            }

        });
});

app.post("/", function (req, res) {
    const itemName = req.body.add;
    
    const item = new Item({
        name:itemName
    })
    item.save();
    res.redirect("/");
    
});




app.get("/:customListName",function(req,res)
{
    const customListName = req.params.customListName;
    List.findOne({name:customListName})
        .then(function (foundlist) {
                if(!foundlist){
                const list = new List({
                    name : customListName,
                    items :defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            }
            
            else{
                
                res.render("list", { listTitle: foundlist.name, newItem : foundlist.items });
            }
        });
});




app.post("/delete",function(req,res)
{
    const checkItems = req.body.checkbox;
    Item.findByIdAndRemove(checkItems)
    .then(function(err)
    {
        if(!err)
        {
            console.log("Success");
            
        }
        res.redirect("/");
    })
});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newItem:workList});
});



app.listen(3000, function () {
    console.log('server is running on port 3000');
})