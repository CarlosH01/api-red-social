const user = require("../models/user");
const Follow = require("../models/follow");
const followUserIds = async (identityUsserId) => {
  try {
    //sacar info seguimiento
    let following = await Follow.find({ user: identityUsserId })
      .select({ _id: 0, followed: 1 })
      .exec();

    let followers = await Follow.find({ followed: identityUsserId })
      .select({ _id: 0, user: 1 })
      .exec();

    //procesar array de identificadores
    let followingClean = [];

    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

    let followersClean = [];

    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });

    return {
      following: followingClean,
      followers: followersClean,
    };
  } catch (error) {
    return {};
  }
};

const followThisUser = async (identityUsserId, profileUserId) => {
  //sacar info seguimiento
  let following = await Follow.findOne({ "user": identityUsserId, "followed":profileUserId })
   

  let follower = await Follow.findOne({ "user":profileUserId, "followed": identityUsserId })


    return {
        following,
        follower
    }
};

module.exports = {
  followUserIds,
  followThisUser,
};
