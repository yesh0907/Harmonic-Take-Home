import { DataGrid } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { getCollectionsById, ICompany } from "../utils/jam-api";
import { AppContext } from "../context/app.context";

const CompanyTable = () => {
  const { selectedCollectionId, setSelectedItemIds } = useContext(AppContext);

  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (selectedCollectionId) {
      getCollectionsById(selectedCollectionId, offset, pageSize).then(
        (newResponse) => {
          setResponse(newResponse.companies);
          setTotal(newResponse.total);
        }
      );
    }
  }, [selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [selectedCollectionId]);

  if (!selectedCollectionId || !response) return null;

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
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={total}
        pagination
        checkboxSelection
        paginationMode="server"
        onPaginationModelChange={(newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
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
