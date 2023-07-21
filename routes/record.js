const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the records.
recordRoutes.route("/menu/:collectionName").get(function (req, res) {
 let db_connect = dbo.getDb("restaurant-menu");
 db_connect
//  .collection("records")
   .collection(req.params.collectionName)
  //  "BiryaniAndRiceVegMenu"
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(function (req, res) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect
   .collection("records")
   .findOne(myquery, function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you create a new record.
recordRoutes.route("/record/add").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myobj = {
   name: req.body.name,
   position: req.body.position,
   level: req.body.level,
 };
 db_connect.collection("records").insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});
 
// This section will help you update a record by id.
recordRoutes.route("/update/:id").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 let newvalues = {
   $set: {
     name: req.body.name,
     position: req.body.position,
     level: req.body.level,
   },
 };
 db_connect
   .collection("records")
   .updateOne(myquery, newvalues, function (err, res) {
     if (err) throw err;
     console.log("1 document updated");
     response.json(res);
   });
});
 
// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect.collection("records").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});

// // POST endpoint to update all price fields in the collection
// recordRoutes.post('/updatePrices', (req, res) => {
//   const collectionName = 'BiryaniAndRiceVegMenu';
//   const updatedPrices = req.body;
//   let db = dbo.getDb();
//   const collection = db.collection(collectionName);

//   console.log(updatedPrices);
//   // Construct an array of update operations for each price field
//   const updateOperations = updatedPrices.map((item) => ({
//     updateOne: {
//       filter: { 'listItems.id': item.Id },
//       update: { $set: { 'listItems.$.price': item.Price } },
//     },
//   }));

//   // Update all price fields in one request
//   collection.bulkWrite(updateOperations, (err, result) => {
//     if (err) {
//       console.log('Error updating prices in the collection:', err);
//       res.sendStatus(500);
//       return;
//     }
//     console.log(result);
//     res.sendStatus(200);
//   });
// });

// Route for updating multiple price fields
recordRoutes.route('/updatePrices')
.post((req, res) => {
  const collectionName = 'BiryaniAndRiceVegMenu';
  const updatedPrices = req.body;
  let db = dbo.getDb();
  const collection = db.collection(collectionName);

  // Construct an array of update operations for each price field
  const updateOperations = updatedPrices.map((item) => ({
    updateOne: {
      filter: { 'listItems.id': item.itemId },
      update: { $set: { 'listItems.$.price': item.newPrice } },
    },
  }));

  // Update all price fields in one request
  collection.bulkWrite(updateOperations, (err, result) => {
    if (err) {
      console.log('Error updating prices in the collection:', err);
      res.sendStatus(500);
      return;
    }
    console.log(result);
    res.sendStatus(200);
  });
});
 
module.exports = recordRoutes;