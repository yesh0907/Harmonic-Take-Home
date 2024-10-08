from enum import Enum
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)

class TaskStatus(str, Enum):
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    FAILED = 'failed'

class Task(BaseModel):
    status: TaskStatus
    progress: int = 0
    error_msg: str = None

# in memory list of background tasks
task_list: dict[str, Task] = {}

@router.get("/{task_id}", response_model=Task)
async def get_task_status(task_id: str):
    if task_id not in task_list:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_list[task_id]