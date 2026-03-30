import { useState } from "react";
import styles from "../../styles/right-sidebar.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Collection } from "../../api/types";

const SourcesContainer = ({
  currentCollection,
  documents,
}: {
  currentCollection: Collection | undefined;
  documents: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSources = () => {
    setIsExpanded((prev) => !prev);
  };
  return (
    <div className={styles.sourcesContainer}>
      <h3 className={styles.sectionTitle}>
        <button onClick={toggleSources} className={styles.toggleButton}>
          {isExpanded ? (
            <>
              Hide sources <ExpandMoreIcon className={styles.icon} />
            </>
          ) : (
            <>
              Show sources <ExpandLessIcon className={styles.icon} />
            </>
          )}
        </button>
      </h3>
      {isExpanded && (
        <div className={styles.sourcesList}>
          {currentCollection?.sources.map((source: unknown) => {
            const sourceObj = documents?.find((doc: { id: unknown }) => doc.id === source);
            if (sourceObj == null) return null;
            return (
              <div key={sourceObj.id} className={styles.sourceItem}>
                <div className={styles.sourceIcon}>📄</div>
                <div className={styles.sourceDetails}>
                  <div className={styles.sourceFileName}>{sourceObj.file_name}</div>
                </div>
              </div>
            );
          })}
          {(!currentCollection?.sources || currentCollection.sources.length === 0) && (
            <div className={styles.noSources}>No sources in this collection</div>
          )}
        </div>
      )}
    </div>
  );
};
export default SourcesContainer;
