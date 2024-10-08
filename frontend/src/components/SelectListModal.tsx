import { Button, Card, CardContent, CardHeader, Modal } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../context/app.context";
import Close from "@mui/icons-material/Close";
import {
  addAllCompaniesToCollection,
  addCompaniesToCollection,
  ICollection,
} from "../utils/jam-api";
import { toast } from "sonner";

export default function SelectListModal() {
  const {
    collections,
    selectedItemIds: companyIds,
    selectedCollectionId,
    showSelectListModal,
    setShowSelectListModal,
    setTaskId,
  } = useContext(AppContext);

  function closeModal() {
    setShowSelectListModal(false);
  }

  function handleSelect(targetList: ICollection) {
    const nbOfCompanies = companyIds.length;
    const targetListName = targetList.collection_name;

    if (nbOfCompanies === 0) {
      const sourceList = collections.filter(
        (c) => c.id === selectedCollectionId
      )[0];
      // add all companies
      toast.info(
        `Adding all items from ${sourceList.collection_name} to ${targetListName}`
      );
      addAllCompaniesToCollection(sourceList.id, targetList.id)
        .then((res) => {
          if (res.task_id) {
            setTaskId(res.task_id);
          } else {
            toast.error("Failed to create task");
          }
        })
        .catch(() => {
          toast.error(`Failed to add all items`);
        });
    } else {
      toast.info(`Adding ${nbOfCompanies} items to ${targetListName}`);
      addCompaniesToCollection(targetList.id, companyIds)
        .then((res) => {
          if (res.success) {
            toast.success(`Added ${nbOfCompanies} items to ${targetListName}`);
          } else {
            toast.error("Failed to add items");
          }
        })
        .catch(() => {
          toast.error(`Failed to add items to ${targetListName}`);
        });
    }
    closeModal();
  }

  const filteredCollections = collections.filter(
    (c) => c.id !== selectedCollectionId
  );

  return (
    <Modal open={showSelectListModal} onClose={closeModal}>
      <Card className="max-w-md mx-auto my-24 rounded-lg shadow-2xl">
        <div className="flex justify-end pt-2 px-1">
          <Button
            onClick={closeModal}
            variant="text"
            color="inherit"
            size="small"
          >
            <Close />
          </Button>
        </div>
        <div className="px-4">
          <CardHeader title="Select a List" />
          <CardContent>
            <ul className="list-none">
              {filteredCollections.map((collection, index) => (
                <li
                  key={index}
                  className="py-2 px-4 my-4 border border-orange-300 hover:bg-orange-500 cursor-pointer"
                  onClick={() => handleSelect(collection)}
                >
                  {collection.collection_name}
                </li>
              ))}
            </ul>
          </CardContent>
        </div>
      </Card>
    </Modal>
  );
}
