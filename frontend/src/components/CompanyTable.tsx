import { DataGrid, GridPaginationModel } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { getCollectionsById, ICompany } from "../utils/jam-api";
import { AppContext } from "../context/app.context";

const CompanyTable = () => {
  const { selectedCollectionId, setSelectedItemIds } = useContext(AppContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    if (selectedCollectionId) {
      setLoading(true);
      getCollectionsById(selectedCollectionId, paginationModel.page * paginationModel.pageSize, paginationModel.pageSize)
        .then((newResponse) => {
          setResponse(newResponse.companies);
          setTotal(newResponse.total);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCollectionId, paginationModel]);

  useEffect(() => {
    setPaginationModel({ page: 0, pageSize: 25 });
  }, [selectedCollectionId]);

  if (!selectedCollectionId || !response) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div style={{ height: 800, width: "100%" }}>
      <DataGrid
        rows={response}
        rowHeight={30}
        columns={[
          { field: "liked", headerName: "Liked", width: 90 },
          { field: "id", headerName: "ID", width: 90 },
          { field: "company_name", headerName: "Company Name", width: 200 },
        ]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={total}
        pagination
        checkboxSelection
        paginationMode="server"
        onRowSelectionModelChange={(rowIds, { api }) => {
          console.log("rowIds", rowIds);
          if (!rowIds) {
            setSelectedItemIds([]);
          } else {
            const companyIds = rowIds
              .map((rowId) => api.getRow(rowId)?.id)
              .filter((id) => id !== undefined);
            setSelectedItemIds(companyIds);
          }
        }}
      />
    </div>
  );
};

export default CompanyTable;
