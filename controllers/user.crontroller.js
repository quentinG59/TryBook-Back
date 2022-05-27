const { json } = require("express/lib/response");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

module.exports.userInfo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("ID unknown : " + err);
  }).select("-password");
};

// modifier un USER
module.exports.updateUser = async (req, res) => {
  console.log(req.params.id);
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const updateUser = await UserModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      bio: req.body.bio,
    },
    { new: true, upsert: true, runValidators: true }
  );
  if (!updateUser) return res.status(500).send({ message: err });
  return res.status(200).json(updateUser);
};
//delete
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.deleteOne({ _id: req.params.id }).exec();
    res.status(200).json({ message: "succesfully delete" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// Follow/Unfollow
module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);
  try {
    const following = await UserModel.findByIdAndUpdate(
      { _id: req.params.id },
      //L' $addToSet opérateur ajoute une valeur à un tableau sauf si la valeur est déjà présente, auquel cas $addToSetne fait rien à ce tableau.
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true, runValidators: true }
    );
    if (!following) return res.status(500).send({ message: err });

    const follower = await UserModel.findByIdAndUpdate(
      { _id: req.body.idToFollow },
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true, runValidators: true }
    );
    if (!follower) return res.status(500).send({ message: err });
    return res.status(200).json(follower);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const following = await UserModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { following: req.body.idToUnFollow } },
      { new: true, upsert: true, runValidators: true }
    );
    if (!following) return res.status(500).send({ message: err });

    const follower = await UserModel.findByIdAndUpdate(
      { _id: req.body.idToUnFollow },
      //L' $pull opérateur supprime d'un tableau existant toutes les instances d'une ou plusieurs valeurs qui correspondent à une condition spécifiée.
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true, runValidators: true }
    );
    if (!follower) return res.status(500).send({ message: err });
    return res.status(200).json(follower);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
