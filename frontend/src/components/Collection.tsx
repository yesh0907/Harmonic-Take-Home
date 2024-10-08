import { useContext } from "react";
import { AppContext } from "../context/app.context";
import { ICollection } from "../utils/jam-api";

interface ICollectionProps {
  collection: ICollection;
}

export default function Collection({ collection }: ICollectionProps) {
  const { selectedCollectionId, setSelectedCollectionId } =
    useContext(AppContext);
  return (
    <div
      className={`py-1 hover:cursor-pointer hover:bg-orange-300 ${
        selectedCollectionId === collection.id && "bg-orange-500 font-bold"
      }`}
      onClick={() => {
        setSelectedCollectionId(collection.id);
      }}
    >
      {collection.collection_name}
    </div>
  );
}
