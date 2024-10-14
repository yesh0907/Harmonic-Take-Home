import axios from "axios";

export interface ICompany {
  id: number;
  company_name: string;
  liked: boolean;
}

export interface ICollection {
  id: string;
  collection_name: string;
  companies: ICompany[];
  total: number;
}

export interface ICompanyBatchResponse {
  companies: ICompany[];
}

export interface IAddCompaniesToCollectionResponse {
  success: boolean;
}

export interface ITaskCreatedResponse {
  task_id: string;
  message: string;
}

export interface ITask {
  status: "in_progress" | "completed" | "failed";
  progress: number;
  error_msg?: string;
}

const BASE_URL = "http://localhost:8000";

export async function getCompanies(
  offset?: number,
  limit?: number
): Promise<ICompanyBatchResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/companies`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsById(
  id: string,
  offset?: number,
  limit?: number,
  name?: string
): Promise<ICollection> {
  try {
    const response = await axios.get(`${BASE_URL}/collections/${id}`, {
      params: {
        offset,
        limit,
        name,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsMetadata(): Promise<ICollection[]> {
  try {
    const response = await axios.get(`${BASE_URL}/collections`);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function addCompaniesToCollection(
  collectionId: string,
  company_ids: string[]
): Promise<IAddCompaniesToCollectionResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL}/collections/${collectionId}/add`,
      {
        company_ids,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding companies:", error);
    throw error;
  }
}

export async function addAllCompaniesToCollection(
  source_collection_id: string,
  target_collection_id: string
): Promise<ITaskCreatedResponse> {
  try {
    const response = await axios.post(`${BASE_URL}/collections/add-all`, {
      source_collection_id,
      target_collection_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding all companies:", error);
    throw error;
  }
}

export async function getTaskStatus(task_id: string): Promise<ITask> {
  try {
    const response = await axios.get(`${BASE_URL}/tasks/${task_id}`);
    return response.data;
  } catch (error) {
    console.log("Error getting task status:", error);
    throw error;
  }
}
