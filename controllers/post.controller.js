const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("error to get data :" + err);
  }).sort({ createdAt: -1 });
};
module.exports.createPost = async (req, res) => {
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};
module.exports.updatePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const updatedRecord = {
    message: req.body.message,
  };

  PostModel.findByIdAndUpdate(
    req.params.id,
    { $set: updatedRecord },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("update error :" + err);
    }
  );
};
module.exports.deletePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  PostModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("delete error:" + err);
  });
};
// like un post
module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const liker = await PostModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $addToSet: { liker: req.body.id },
      },
      { new: true, upsert: true, runValidators: true }
    );
    if (!liker) return res.status(400).send(err);

    const likes = await UserModel.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true, upsert: true, runValidators: true }
    );
    if (!likes) res.status(500).send(err);
    return res.status(200).json(likes);
  } catch (err) {
    return res.status(400).send(err);
  }
};
//dislike un post
module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const liker = await PostModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { liker: req.body.id },
      },
      { new: true, upsert: true, runValidators: true }
    );
    if (!liker) return res.status(400).send(err);

    const likes = await UserModel.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $pull: { likes: req.params.id },
      },
      { new: true, upsert: true, runValidators: true }
    );
    if (!likes) res.status(500).send(err);
    return res.status(200).json(likes);
  } catch (err) {
    return res.status(400).send(err);
  }
};
//!
// comment

module.exports.commentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch (err) {
    return res.status(400).send(err);
  }
};

//edit comment
module.exports.editCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    //La méthode equals() en JavaScript détermine si l’objet qui appelle la méthode est égal à l’objet qui est passé en argument.
    return PostModel.findById(req.params.id, (err, docs) => {
      const theComment = docs.comments.find((comment) => {
        if (comment._id.equals(req.body.commentId)) {
          return comment;
        }
      });

      theComment.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

// delete comments
module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch {
    return res.status(400).send(err);
  }
};
