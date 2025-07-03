db["wishlists"].aggregate([
  {
    $match: {
      user_id: ObjectId("67eb88b60fb61a214d3ca23d"),
    },
  },
  { $unwind: { path: "$products" } },
  {
    $lookup: {
      from: "products",
      localField: "products.product_id",
      foreignField: "_id",
      as: "productREF",
    },
  },
  {
    $unwind: {
      path: "$productREF",
      preserveNullAndEmptyArrays: false,
    },
  },

  {
    $group: {
      _id: "$user_id",
      total_items: { $sum: 1 },

      products: {
        $push: {
          product_id: "products.product_id",
          product_name: "$productREF.product_name",
        },
      },
    },
  },
]);
