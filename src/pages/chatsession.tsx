import React, { useRef, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Components } from "react-markdown";
import styles from "../styles/chatsession.module.css";
import { api } from "../api/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { Link, useParams } from "react-router-dom";
import { UUID } from "../api/types";
import { motion } from "framer-motion";

interface ChatSessionProps {
  // chat_id: string;
  personality?: string;
}

// i am not that confident about this
// https://github.com/orgs/remarkjs/discussions/714
const components: Components = {
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        {...(props as any)}
        style={atomDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: "0" }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    );
  },
};

const ChatSession: React.FC<ChatSessionProps> = ({ personality }) => {
  const { collection_id: collectionId } = useParams<{ collection_id: UUID }>();
  const [currentMessage, setCurrentMessage] = useState("");
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{ [key: number]: boolean }>({});
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [showEmptyMessagePopup, setShowEmptyMessagePopup] = useState(false);
  const [fadePopup, setFadePopup] = useState(false);
  const [isPopupActive, setIsPopupActive] = useState(false);

  const { data: collectionData, isLoading: getChatMessagesLoading } = api.endpoints.getAllCollectionChats.useQuery(
    {
      collection_id: collectionId!,
    },
    { skip: collectionId == null },
  );

  const matchingChat = collectionData?.find(
    (chat) => chat.personality === personality || (chat.personality === null && personality === "qa"),
  );

  const chat_id_from_matching = matchingChat?.id ?? null;

  const [sendMessage] = api.endpoints.createChatMessage.useMutation();

  const { data: fileTree } = api.endpoints.getAllFolders.useQuery();
  const documents = fileTree?.flatMap((folder) => folder.documents);

  const { data: collections } = api.endpoints.getAllCollections.useQuery();

  const currentCollection = collections?.find((collection) => collection.id === collectionId);

  const collectionDocuments = useMemo(() => {
    const docMap = new Map<string, string>();

    if (currentCollection?.sources && documents) {
      currentCollection.sources.forEach((source) => {
        const sourceObj = documents.find((doc) => doc.id === source);
        if (sourceObj) {
          console.log(`Found document mapping: ${sourceObj.id} -> ${sourceObj.file_name}`);
          docMap.set(sourceObj.id, sourceObj.file_name);
        }
      });
    }
    return docMap;
  }, [currentCollection?.sources, documents]);

  const allChatMessages = [...(matchingChat?.chat_messages || []), ...localMessages];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottomAuto = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [collectionData]);

  React.useEffect(() => {
    scrollToBottomAuto();
  }, [personality]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus({ ...copyStatus, [index]: true });
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [index]: false });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleSendMessage = async () => {
    if (chat_id_from_matching == null) return;

    if (currentMessage.trim() !== "") {
      const messageToSend = {
        message: currentMessage,
        chat_id: chat_id_from_matching,
      };

      const latestMessageId = Math.max(...allChatMessages.map((msg) => msg.seq_num), 0);
      const tempMessage = {
        id: latestMessageId + 1, // temporary ID
        message: currentMessage,
        sender: "user",
        created_at: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, tempMessage]);

      setTimeout(scrollToBottom, 100);
      setCurrentMessage("");
      setIsMessageSending(true);

      try {
        await sendMessage(messageToSend).unwrap();
        setLocalMessages([]);
      } catch (error) {
        console.error("Failed to send message - Error:", error);
      } finally {
        setIsMessageSending(false);
        setTimeout(scrollToBottom, 100); // scroll to AI response
      }
    } else {
      console.log("Messages cannot be empty");

      if (!isPopupActive) {
        setIsPopupActive(true);
        setShowEmptyMessagePopup(true);

        setTimeout(() => setFadePopup(true), 0);
        setTimeout(() => {
          setFadePopup(false);
          setTimeout(() => {
            setShowEmptyMessagePopup(false);
            setIsPopupActive(false);
          }, 500);
        }, 2000);
      }
    }
  };

  const example_text = {
    qa: ["Explain the key concepts from my study materials", "Why is ___ true or false?"],
    quiz: ["Create a practice quiz on my study notes", "Test my knowledge on these key concepts"],
    braindump: ["Organize my scattered thoughts on this topic", "Help me connect the dots in my understanding"],
  };

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const replaceDocumentIds = (message: string) => {
    // Match text between angle brackets
    const angleRegex = /<([^>]+)>/g;

    return message.replace(angleRegex, (_match, content) => {
      console.log("Processing match:", {
        content,
        isUUID: isValidUUID(content),
        hasFileName: collectionDocuments.has(content),
      });

      // If it's not a valid UUID, keep the original brackets and content
      if (!isValidUUID(content)) {
        console.log("Not a valid UUID:", content);
        return "";
      }

      // If it's a valid UUID, try to replace with filename
      const fileName = collectionDocuments.get(content);
      if (fileName) {
        return fileName;
      }
      console.log("Could not find UUID", content);
      return "";
    });
  };

  // TODO: fix
  if (collectionId == null) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.noCollectionsContainer}>
          <div className={styles.noCollections}>Select a collection</div>
          <Link to="/files">
            <motion.button
              className={styles.noCollectionsButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Folders
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {getChatMessagesLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 3, gap: 1 }}>
            <Skeleton variant="rectangular" width="30%" height={20} />
            <Skeleton variant="rectangular" width="30%" height={20} />
            <Skeleton variant="rectangular" width="30%" height={20} />
            <Skeleton variant="rectangular" width="30%" height={20} />
          </Box>
        ) : allChatMessages?.length === 0 ? (
          <div className={styles.welcomeMessage}>
            {example_text[(personality || "qa") as keyof typeof example_text].map((text: string, index: number) => (
              <div key={index} className={styles.suggestionBox}>
                {text}
              </div>
            ))}
          </div>
        ) : (
          <>
            {allChatMessages?.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender != null
                    ? `${styles.message} ${styles.messageUser}`
                    : `${styles.message} ${styles.messageBot}`
                }
              >
                <div className={styles.messageContent}>
                  <ReactMarkdown components={components}>{replaceDocumentIds(msg.message)}</ReactMarkdown>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopy(msg.message, index)}
                    aria-label="Copy message"
                  >
                    {copyStatus[index] ? (
                      <CheckIcon sx={{ width: 16, height: 16 }} />
                    ) : (
                      <ContentCopyIcon sx={{ width: 16, height: 16 }} />
                    )}
                  </button>
                </div>
              </div>
            ))}
            {isMessageSending && (
              <div className={`${styles.message} ${styles.messageBot}`}>
                <div className={styles.messageContent}>
                  <div className={styles.bouncingLoader}>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        {/* <div ref={messagesEndRef} /> */}
      </div>

      {showEmptyMessagePopup && (
        <div className={`${styles.popup} ${fadePopup ? styles.fadeIn : styles.fadeOut}`}>Messages cannot be empty!</div>
      )}

      <div className={styles.inputContainer}>
        <div className={styles.textSubmitContainer}>
          <textarea
            className={styles.inputField}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <button className={styles.sendButton} onClick={handleSendMessage} aria-label="Send message">
            <SendIcon />
          </button>
        </div>
      </div>
      <div className={styles.disclaimerMessage}>
        LLM's can hallucinate or make mistakes. Check important information. Students must disclose use of this tool in
        any shape or form in accordance with university policy.
      </div>
    </div>
  );
};

export default ChatSession;
