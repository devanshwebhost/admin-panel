import Task from "@/models/Task";
import User from "@/models/User";

/**
 * Get task statistics for a team
 * @param {string} teamId - The ID of the team
 * @returns {Object} taskStats - { total, completed, pending, delayed }
 */
export async function getTeamTaskStats(teamId) {
  // 1. Get all users in the team
  const users = await User.find({ team: teamId }).select('_id');

  const userIds = users.map(user => user._id);

  // 2. Get all tasks assigned to these users
  const tasks = await Task.find({ assignedTo: { $in: userIds } });

  const now = new Date();

  // 3. Calculate task stats
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === "complete").length;
  const delayed = tasks.filter(task => task.status !== "complete" && new Date(task.dueDate) < now).length;
  const pending = total - completed;

  return {
    total,
    completed,
    pending,
    delayed
  };
}
