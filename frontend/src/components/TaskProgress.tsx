import { useEffect, useContext } from "react";
import { AppContext } from "../context/app.context";
import { getTaskStatus } from "../utils/jam-api";
import { Typography, LinearProgress } from "@mui/material";

const TaskProgress = () => {
  const { taskId, task, setTask } = useContext(AppContext);

  useEffect(() => {
    const checkTaskStatus = async () => {
      if (!taskId) return;

      try {
        const data = await getTaskStatus(taskId);
        setTask(data);

        if (data.status === "completed" || data.status === "failed") {
          // Task is finished, stop checking (ideally, I clean up my timer)
          return;
        }

        // Check again after 5 seconds
        setTimeout(checkTaskStatus, 5000);
      } catch (error) {
        console.error("Error checking task status:", error);
      }
    };

    checkTaskStatus();
  }, [taskId]);

  if (!taskId || !task) {
    return null;
  }

  let taskStatus = "In Progress";
  if (task && (task.status === "completed" || task.status === "failed")) {
    // capitalize task status
    taskStatus = `${task.status.charAt(0).toUpperCase()}${task.status.substring(
      1
    )}`;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      {task && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Typography variant="body1" className="font-semibold">
              Status: {taskStatus}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {task.progress}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={task.progress}
            className="w-full"
          />
          {task.error_msg && (
            <Typography variant="body2" color="error" className="mt-2">
              Error: {task.error_msg}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskProgress;
