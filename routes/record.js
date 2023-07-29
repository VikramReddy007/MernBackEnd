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

recordRoutes.route("/updateItemPrice/:collectionName").put(
  async (req, res) => {
    try {
      const itemName = req.body.name;
      const newPrice = req.body.newPrice; // Assuming the new price is sent in the request body
      console.log(itemName+"-->"+newPrice);
      // Find the document with the name 'Veg Spring Roll'
      const filter = { 'listItems.name': itemName };
      const update = { $set: { 'listItems.$.price': newPrice } };
  
      let db_connect = dbo.getDb();
      const result = await db_connect.collection(req.params.collectionName).updateOne(filter, update);
  
      if (result.matchedCount > 0) {
        res.status(200).json({ message: itemName+' price updated successfully!' });
      } else {
        res.status(404).json({ message: itemName+' not found in the database.' });
      }
    } catch (error) {
      console.error('Error updating price:', error);
      res.status(500).json({ message: 'Error updating price.' });
    }
  }
)

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