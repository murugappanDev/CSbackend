let getCart = await cartModel.aggregate([
  {
    $match: {
      user_id: new mongoose.Types.ObjectId(user_id),
    },
  },
  { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }, // Unwind items, keep empty carts
  {
    $lookup: {
      from: "products",
      localField: "items.product_id",
      foreignField: "_id",
      as: "productREF",
    },
  },
  {
    $unwind: { path: "$productREF", preserveNullAndEmptyArrays: true }, // Unwind productREF, keep items without products
  },
  {
    $addFields: {
      matchedVariant: {
        $filter: {
          input: "$productREF.items",
          as: "variant",
          cond: { $eq: ["$$variant._id", "$items.product_variant_id"] },
        },
      },
    },
  },
  {
    $unwind: {
      path: "$matchedVariant",
      preserveNullAndEmptyArrays: true,
    }, // Unwind matched variant
  },
  {
    $group: {
      _id: "$_id",
      user_id: { $first: "$user_id" },
      items: {
        $push: {
          product_id: "$items.product_id",
          product_name: "$productREF.product_name",
        },
       
      },
      cart_total:{$first:"$cart_total"}
    },
  },
]);
