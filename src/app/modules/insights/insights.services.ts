import { JwtPayload } from "jsonwebtoken";
import Post from "../post/post.model";
import { Payment } from "../payments/payment.model";
import { User } from "../user/user.model";

// -------------------- get user insights --------------------
/** TODO:
 * @param followers user jwt payload
 * @returns return user posts, payments, followers and followings
 */
const getUserInsightsFromDB = async (user: JwtPayload) => {
  // calculate total posts
  const totalPosts = await Post.find({
    author: user?.userId,
    isDeleted: false,
  });
};

// -------------------- get admin insights --------------------
/**
 * @param followers user jwt payload
 * @returns return all posts, revenue and payments
 */
const getAdminInsightsFromDB = async (user: JwtPayload) => {
  // Calculate total posts
  const totalPostsPromise = Post.aggregate([
    { $match: { isDeleted: false } },
    { $count: "totalPosts" },
  ]);

  // Calculate total payments and total revenues
  const totalRevenuePromise = Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  // Calculate total users
  const totalUsersPromise = User.aggregate([
    { $match: { isDeleted: false, status: "active" } },
    { $count: "totalUsers" },
  ]);

  // Resolve all promises in parallel
  const [postsResult, revenueResult, usersResult] = await Promise.all([
    totalPostsPromise,
    totalRevenuePromise,
    totalUsersPromise,
  ]);

  // Get actual values from the aggregation results
  const totalPosts = postsResult.length > 0 ? postsResult[0].totalPosts : 0;
  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  const totalUsers = usersResult.length > 0 ? usersResult[0].totalUsers : 0;

  return { totalUsers, totalRevenue, totalPosts };
};

// -------------------- get get Monthly Overview --------------------
const getMonthlyOverviewFromDB = async (user: JwtPayload) => {
  // Aggregate total payments by month
  const paymentsByMonthPromise = Payment.aggregate([
    {
      $match: {
        status: "completed",
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        totalPayments: { $sum: "$amount" },
      },
    },
  ]);

  // Aggregate total users by month
  const usersByMonthPromise = User.aggregate([
    {
      $match: {
        isDeleted: false,
        status: "active",
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalUsers: { $sum: 1 },
      },
    },
  ]);

  // Aggregate total posts by month
  const postsByMonthPromise = Post.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalPosts: { $sum: 1 },
      },
    },
  ]);

  // Resolve all promises in parallel
  const [paymentsByMonth, usersByMonth, postsByMonth] = await Promise.all([
    paymentsByMonthPromise,
    usersByMonthPromise,
    postsByMonthPromise,
  ]);

  // Month name
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Combine the data for each month
  const monthlyData = monthNames.map((name, index) => {
    const month = index + 1; // MongoDB uses 1-12 for months

    const payments =
      paymentsByMonth.find((p) => p._id === month)?.totalPayments || 0;
    const users = usersByMonth.find((u) => u._id === month)?.totalUsers || 0;
    const posts = postsByMonth.find((p) => p._id === month)?.totalPosts || 0;

    return { name, payments, users, posts };
  });

  return monthlyData;
};

export const InsightServices = {
  getUserInsightsFromDB,
  getAdminInsightsFromDB,
  getMonthlyOverviewFromDB,
};
