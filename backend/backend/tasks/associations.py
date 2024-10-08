import concurrent.futures
import uuid
import time

from backend.db import database
from backend.db.database import SessionLocal
from backend.routes.tasks import (
    task_list,
    Task,
    TaskStatus
)

def _insert_batch(thread_id, batch, target_id):
    db = SessionLocal()
    try:
        print(f"thread {thread_id}, starting to create {len(batch)} associations")
        new_associations = [
            database.CompanyCollectionAssociation(collection_id=target_id, company_id=company_id)
            for (company_id,) in batch
        ]
        db.bulk_save_objects(new_associations)
        db.commit()
        print(f"thread {thread_id}, finished creating {len(batch)} associations")
    finally:
        db.close()


def process_associations(task_id: str, company_ids: list[int], target_id: uuid.UUID):
    try:
        task_list[task_id] = Task(status=TaskStatus.IN_PROGRESS)
        batch_size = 1000
        total_batches = (len(company_ids) + batch_size - 1) // batch_size
        max_workers = 5

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = []
            for i in range(0, len(company_ids), batch_size):
                thread_id = (i // batch_size) % max_workers
                batch = company_ids[i:i+batch_size]
                futures.append(executor.submit(_insert_batch, thread_id, batch, target_id))

            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                future.result()  # This will raise an exception if the task failed
                progress = min(100, int((i + 1) / total_batches * 100))
                print(f"task {task_id} progress: {progress}")
                task_list[task_id].progress = progress
                time.sleep(0.1)  # Small delay to allow other operations

        task_list[task_id].status = TaskStatus.COMPLETED
        task_list[task_id].progress = 100
    except Exception as e:
        task_list[task_id].status = TaskStatus.FAILED
        task_list[task_id].error_msg = str(e)