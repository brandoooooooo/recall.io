import { useState } from "react";
// import { useParams } from "react-router-dom";
import styles from "../styles/chatpage.module.css";
import LeftSidebar from "../components/left-sidebar";
import RightSidebar from "../components/right-sidebar";
import ChatSession from "./chatsession";
import { api } from "../api/api";

export default function Chat() {
  // const { collection_id: collectionId } = useParams();
  // const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // Remove URL-based personality selection
  const [selectedPersonality, setSelectedPersonality] = useState<string>("qa");
  const { data: collections } = api.endpoints.getAllCollections.useQuery();

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
  };

  // const handleToggleRightSidebar = () => {
  //   setIsRightSidebarCollapsed(!isRightSidebarCollapsed);
  // };

  return (
    <div className={styles.contentContainer}>
      <aside className={styles.sidemenu}>
        <LeftSidebar collections={collections} />
      </aside>

      <section className={styles.chatbox}>
        <ChatSession personality={selectedPersonality} />
      </section>

      <aside className={styles.rightSidebarContainer}>
        <RightSidebar
          collections={collections}
          selectedPersonality={selectedPersonality}
          onPersonalitySelect={handlePersonalitySelect}
        />
      </aside>
    </div>
  );
}
