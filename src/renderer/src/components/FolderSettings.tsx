import { useEffect, useMemo, useState } from 'react';
import { StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment } from 'react-complex-tree';
import '@renderer/styles/TreeStyles.css';
import { HiArrowLeft, HiTrash } from 'react-icons/hi';
import RemoveFolderConfirmDialog from './RemoveFolderConfirmDialog';
import { useNavigate } from 'react-router-dom';
import path from 'path-browserify';
import { Image } from '@shared/types';

interface TreeItem {
  index: string;
  isFolder: boolean;
  children: string[];
  data: string;
}

const FolderSettings = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; folderPath: string }>({
    isOpen: false,
    folderPath: '',
  });

  useEffect(() => {
    const loadImages = async () => {
      try {
        const fetchedImages = await window.api.getImages();
        console.log(fetchedImages);
        setImages(fetchedImages);
      } finally {
        setIsLoading(false);
      }
    };
    void loadImages();
  }, []);
  const navigate = useNavigate();

  const treeData = useMemo(() => {
    const items: Record<string, TreeItem> = {
      root: {
        index: 'root',
        isFolder: true,
        children: [],
        data: 'Root',
      },
    };

    // Process each image path to build the tree structure
    images.forEach((image) => {
      const imagePath = image.path;
      // Handle Windows drive letters and root paths
      const parts = imagePath.split(path.sep);
      const dirParts = parts.slice(0, -1); // Skip the last part (filename)

      // Handle root path specially
      let currentPath = parts[0];
      if (currentPath === '') {
        currentPath = path.sep; // Unix root
      }

      // Add root path if not exists
      if (!items[currentPath]) {
        items[currentPath] = {
          index: currentPath,
          isFolder: true,
          children: [],
          data: currentPath,
        };
        items.root.children.push(currentPath);
      }

      // Start from index 1 since we handled root specially
      // Process remaining path parts
      for (let i = 1; i < dirParts.length; i++) {
        const part = dirParts[i];
        if (!part) continue; // Skip empty parts

        const fullPath = path.join(currentPath, part);
        currentPath = fullPath;

        if (!items[fullPath]) {
          items[fullPath] = {
            index: fullPath,
            isFolder: true,
            children: [],
            data: part,
          };

          // Add to parent's children
          const parentPath = path.dirname(fullPath);
          const parent = items[parentPath];

          if (parent && !parent.children.includes(fullPath)) {
            parent.children.push(fullPath);
          }
        }
      }
    });

    console.log(items);

    return items;
  }, [images]);

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/')} className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <HiArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold">Folder Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <UncontrolledTreeEnvironment
            key={images.length} // Add key to force re-render when images change
            dataProvider={
              new StaticTreeDataProvider(treeData, (item) => ({
                ...item,
                canMove: false,
                canRename: false,
              }))
            }
            getItemTitle={(item) => item.data}
            viewState={{
              'folder-tree': {
                expandedItems: Object.keys(treeData),
              },
            }}
            canDragAndDrop={false}
            canDropOnFolder={false}
            canReorderItems={false}
          >
            <Tree
              treeId="folder-tree"
              rootItem="root"
              renderItem={({ item, title, arrow, children }) => (
                <>
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center">
                      {arrow}
                      <span className="ml-1">{title}</span>
                    </div>
                    {item.isFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDialog({
                            isOpen: true,
                            folderPath: (item as TreeItem).index,
                          });
                        }}
                        className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {children}
                </>
              )}
              renderItemArrow={({ item, context }) =>
                item.children?.length ? (
                  <div className={`rct-tree-item-arrow ${context.isExpanded ? 'rct-tree-item-arrow-expanded' : ''}`}>
                    <span style={{ fontSize: '10px' }}>▶</span>
                  </div>
                ) : (
                  <div className="rct-tree-item-arrow" />
                )
              }
            />
          </UncontrolledTreeEnvironment>
        )}
      </div>
      <RemoveFolderConfirmDialog
        isOpen={confirmDialog.isOpen}
        onRequestClose={() => setConfirmDialog({ isOpen: false, folderPath: '' })}
        onConfirm={async () => {
          const updatedImages = await window.api.removeImagesInFolder(confirmDialog.folderPath);
          setImages(updatedImages);
        }}
        title="Remove Folder"
        message={`Are you sure you want to remove all images in "${confirmDialog.folderPath}" from the application? This won't delete the actual files from your disk.`}
      />
    </div>
  );
};

export default FolderSettings;
