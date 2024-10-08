import uuid

from fastapi import APIRouter, Depends, Query, Body, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from backend.db import database
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

class AddCompaniesToCollectionOutput(BaseModel):
    success: bool


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
    target_list = (
        db.query(database.CompanyCollection)
        .filter(database.CompanyCollection.id == collection_id)
        .first()
    )

    if target_list is None:
        raise HTTPException(status_code=400, detail="Collection not found")
    
    batch_size = 1000
    associations_to_create = []

    for company_id in body.company_ids:
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
        

    for i in range(0, len(associations_to_create), batch_size):
        batch_assosciations = associations_to_create[i:i+batch_size]
        db.add_all(batch_assosciations)
    
    db.commit()
    
    return {
        "success": True
    }
