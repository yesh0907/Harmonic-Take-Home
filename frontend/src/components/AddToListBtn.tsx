import AddIcon from "@mui/icons-material/Add";
import { useContext } from "react";
import { AppContext } from "../context/app.context";

export default function AddToListBtn() {
  const { selectedItemIds, setShowSelectListModal } = useContext(AppContext);
  const selectedQty = selectedItemIds.length
    ? `${selectedItemIds.length}`
    : "All";
  const itemGrammar = selectedItemIds.length === 1 ? "Item" : "Items";
  return (
    <button
      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 hover:border-orange-300 focus:outline-none"
      onClick={() => setShowSelectListModal(true)}
    >
      <AddIcon className="h-4 w-4 mr-2" />
      Add {selectedQty} {itemGrammar} to List
    </button>
  );
}
