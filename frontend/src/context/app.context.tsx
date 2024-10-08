import { createContext, ReactNode, useState } from "react";
import { ICollection, ITask } from "../utils/jam-api";

interface IAppContext {
  collections: ICollection[];
  setCollections: (collections: ICollection[]) => void;
  selectedCollectionId?: string;
  setSelectedCollectionId: (collectionId: string) => void;
  selectedItemIds: string[];
  setSelectedItemIds: (ids: string[]) => void;
  showSelectListModal: boolean;
  setShowSelectListModal: (newVal: boolean) => void;
  taskId?: string;
  setTaskId: (id: string) => void;
  task?: ITask;
  setTask: (t: ITask) => void;
}

export const AppContext = createContext<IAppContext>({
  collections: [],
  setCollections: () => {},
  selectedItemIds: [],
  setSelectedCollectionId: () => {},
  setSelectedItemIds: () => {},
  showSelectListModal: false,
  setShowSelectListModal: () => {},
  setTaskId: () => {},
  setTask: () => {},
});

interface IAppContextProviderProps {
  children?: ReactNode;
}

export function AppContextProvider({ children }: IAppContextProviderProps) {
  const [collections, setCollections] = useState<ICollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showSelectListModal, setShowSelectListModal] =
    useState<boolean>(false);
  const [taskId, setTaskId] = useState<string>();
  const [task, setTask] = useState<ITask>();

  return (
    <AppContext.Provider
      value={{
        collections,
        setCollections: (collections) => setCollections(collections),
        selectedCollectionId,
        setSelectedCollectionId: (collectionId) =>
          setSelectedCollectionId(collectionId),
        selectedItemIds,
        setSelectedItemIds: (ids) => setSelectedItemIds(ids),
        showSelectListModal,
        setShowSelectListModal: (newVal) => setShowSelectListModal(newVal),
        taskId,
        setTaskId: (id) => setTaskId(id),
        task,
        setTask: (t) => setTask(t),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
