import uuid
from fastapi import APIRouter, Depends, Query, Body, HTTPException, BackgroundTasks, status
from pydantic import BaseModel
from sqlalchemy import func, and_, not_
from sqlalchemy.orm import Session

from backend.db import database
from backend.tasks import associations
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)

router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)

class CompanyCollectionMetadata(BaseModel):
    id: uuid.UUID
    collection_name: str

class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    pass

class AddCompaniesToCollectionBody(BaseModel):
    company_ids: list[int]

class AddAllCompaniesToCollectionBody(BaseModel):
    source_collection_id: uuid.UUID
    target_collection_id: uuid.UUID

class TaskCreatedOutput(BaseModel):
    task_id: uuid.UUID
    message: str

class AddCompaniesToCollectionOutput(BaseModel):
    success: bool

def collection_exists(collection_id: uuid.UUID, db: Session):
    collection = (
        db.query(database.CompanyCollection)
        .filter(database.CompanyCollection.id == collection_id)
        .first()
    )

    return collection is not None

def get_associations_to_create(company_ids: list[uuid.UUID], collection_id: uuid.UUID, db: Session) -> list[database.CompanyCollectionAssociation]:
    associations_to_create = []

    for company_id in company_ids:
        association_exists = (
            db.query(database.CompanyCollectionAssociation)
            .filter(
                and_(
                    database.CompanyCollectionAssociation.collection_id == collection_id,
                    database.CompanyCollectionAssociation.company_id == company_id
                )
            )
            .first()
        )

        if not association_exists:
            association = database.CompanyCollectionAssociation(collection_id=collection_id, company_id=company_id)
            associations_to_create.append(association)
    
    return associations_to_create

def batch_create_associations(
        associations_to_create: list[database.CompanyCollectionAssociation],
        db: Session):
    batch_size = 1000
    for i in range(0, len(associations_to_create), batch_size):
        batch_assosciations = associations_to_create[i:i+batch_size]
        db.add_all(batch_assosciations)
    
    db.commit()

@router.get("", response_model=list[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
):
    collections = db.query(database.CompanyCollection).all()

    return [
        CompanyCollectionMetadata(
            id=collection.id,
            collection_name=collection.collection_name,
        )
        for collection in collections
    ]


@router.get("/{collection_id}", response_model=CompanyCollectionOutput)
def get_company_collection_by_id(
    collection_id: uuid.UUID,
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    db: Session = Depends(database.get_db),
):
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )

    total_count = query.with_entities(func.count()).scalar()

    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=db.query(database.CompanyCollection)
        .get(collection_id)
        .collection_name,
        companies=companies,
        total=total_count,
    )

@router.post("/{collection_id}/add", response_model=AddCompaniesToCollectionOutput)
def add_companies_to_collection(
    collection_id: uuid.UUID,
    body: AddCompaniesToCollectionBody = Body(),
    db: Session = Depends(database.get_db)
):
    if not collection_exists(collection_id, db):
        raise HTTPException(status_code=400, detail="Collection not found")

    associations_to_create = get_associations_to_create(body.company_ids, collection_id, db)
    batch_create_associations(associations_to_create, db)
    
    return AddCompaniesToCollectionOutput(success=True)

@router.post("/add-all", response_model=TaskCreatedOutput, status_code=status.HTTP_202_ACCEPTED)
async def add_all_companies_to_collection(
    background_tasks: BackgroundTasks,
    body: AddAllCompaniesToCollectionBody = Body(),
    db: Session = Depends(database.get_db),
):
    source_id = body.source_collection_id
    target_id = body.target_collection_id
    if not collection_exists(source_id, db):
        raise HTTPException(status_code=400, detail="Source collection not found")

    if not collection_exists(target_id, db):
        raise HTTPException(status_code=400, detail="Target collection not found")
    
    # Get company IDs from the source collection that are not in the target collection
    new_company_ids = db.query(database.CompanyCollectionAssociation.company_id).filter(
        and_(
            database.CompanyCollectionAssociation.collection_id == source_id,
            not_(
                database.CompanyCollectionAssociation.company_id.in_(
                    db.query(database.CompanyCollectionAssociation.company_id).filter(
                        database.CompanyCollectionAssociation.collection_id == target_id
                    )
                )
            )
        )
    ).distinct().all()

    print(f"going to add {len(new_company_ids)} companies to collection")

    # Start the background task
    task_id = str(uuid.uuid4())
    background_tasks.add_task(associations.process_associations, task_id, new_company_ids, target_id)

    return TaskCreatedOutput(task_id=task_id, message="Task created")
