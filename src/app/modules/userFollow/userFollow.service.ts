import { User } from "../user/user.model";
import UserFollow from "./userFollow.model";

/**
 * ------------- follow/unfollow an user ----------------
 *
 * who follow whom. who (follower) -> whom (following)
 * @param currentUser who want to follow 'targetUser'
 * @param targetUser whom currentUser will follow
 * @returns newly created UserFollow data
 */
const toggleFollow = async (currentUser: string, targetUser: string) => {
  if (targetUser === currentUser) throw new Error("You cannot follow yourself");

  // check if already following
  const existingFollow = await UserFollow.findOne({
    followerId: currentUser,
    followingId: targetUser,
  });

  if (existingFollow) {
    // as exist, delete follow data
    await existingFollow.deleteOne();

    // dec by 1 following count in user profile
    await User.findByIdAndUpdate(currentUser, {
      $inc: { followingCount: -1 },
    });

    // dec follower count by 1 in the target user
    await User.findByIdAndUpdate(targetUser, { $inc: { followerCount: -1 } });
    return { isFollowing: false };
  } else {
    // as no follow data. so we create new userFollow record
    await UserFollow.create({
      follower: currentUser,
      following: targetUser,
    });

    // current user now followingCount by 1
    await User.findByIdAndUpdate(currentUser, {
      $inc: { followingCount: 1 },
    });

    // targetUer get 1 follower. so update by 1
    await User.findByIdAndUpdate(targetUser, { $inc: { followerCount: 1 } });

    return { isFollowing: true };
  }
};

export const UserFollowService = {
  toggleFollow,
};
