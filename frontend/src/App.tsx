import "./App.css";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useContext, useEffect } from "react";
import CompanyTable from "./components/CompanyTable";
import { getCollectionsMetadata } from "./utils/jam-api";
import useApi from "./utils/useApi";
import AddToListBtn from "./components/AddToListBtn";
import { AppContext } from "./context/app.context";
import Collection from "./components/Collection";
import SelectListModal from "./components/SelectListModal";
import { Toaster } from "sonner";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const { collections, setCollections, setSelectedCollectionId } =
    useContext(AppContext);
  const { data: collectionResponse } = useApi(() => getCollectionsMetadata());

  useEffect(() => {
    if (collectionResponse) {
      setCollections(collectionResponse);
      setSelectedCollectionId(collectionResponse?.[0]?.id);
    }
  }, [collectionResponse]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Toaster position="bottom-right" richColors />
      <CssBaseline />
      <div className="mx-8">
        <div className="flex justify-between">
          <div className="font-bold text-xl border-b p-2 mb-4 text-left">
            Harmonic Jam
          </div>
          <AddToListBtn />
        </div>
        <div className="flex">
          <div className="w-1/5">
            <p className="font-bold border-b pb-2">Collections</p>
            <div className="flex flex-col gap-2">
              {collections?.map((collection) => (
                <Collection collection={collection} />
              ))}
            </div>
          </div>
          <div className="w-4/5 ml-4">
            <CompanyTable />
          </div>
        </div>
        <SelectListModal />
      </div>
    </ThemeProvider>
  );
}

export default App;
