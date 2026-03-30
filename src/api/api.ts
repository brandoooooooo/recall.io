import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  User,
  STS,
  Chat,
  ChatMessage,
  FolderWithDocuments,
  UUID,
  Document,
  ChatWithMessages,
  Collection,
} from "./types";

function providesList<R extends { id: string | number }[], T extends string>(
  resultsWithIds: R | undefined,
  tagType: T,
) {
  return resultsWithIds
    ? [{ type: tagType, id: "LIST" }, ...resultsWithIds.map(({ id }) => ({ type: tagType, id }))]
    : [{ type: tagType, id: "LIST" }];
}

const getToken = () => {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASEURL || "http://127.0.0.1:8000/api/v1", // replace with baseUrl, given that you changed env

    // inspo https://stackoverflow.com/questions/68561750/how-to-add-headers-to-endpoints-in-rtk-query-plugin
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["User", "STS", "Chat", "ChatMessages", "Folder", "Document", "Collection"],
  endpoints: (builder) => ({
    sendUser: builder.mutation<string, { display_name: string }>({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["User"],
    }),
    acceptAup: builder.mutation<void, void>({
      query: () => ({
        url: "/user/aup/accept",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    // TODO: type this
    getSTS: builder.query<STS, void>({
      query: () => "/creds/temp-upload-creds",
      providesTags: ["STS"],
    }),

    /* User */
    getSelf: builder.query<User, void>({
      query: () => "/user/self",
      providesTags: ["User"],
    }),

    /* Chat/ChatMessage */
    getAllChats: builder.query<Chat[], void>({
      query: () => "/chat/",
      providesTags: (result) => providesList(result, "Chat"),
    }),
    // warning: this one might be broken but we don't use so just stay away for now
    getAllChatMessages: builder.query<{ id: UUID; chat_messages: ChatMessage[] }[], void>({
      query: () => "/chat/message",
      providesTags: (result) => providesList(result, "ChatMessages"),
    }),
    getAllCollectionChats: builder.query<ChatWithMessages[], { collection_id: UUID }>({
      query: ({ collection_id }) => `/collection/${collection_id}/chats`,
      providesTags: (result) => providesList(result, "Chat"),
    }),
    createChat: builder.mutation<Chat, Pick<Chat, "name" | "collection_id">>({
      query: (data) => ({
        url: "/chat/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result) => (result ? [{ type: "Chat", id: result.id }] : ["Chat"]),
    }),
    createChatMessage: builder.mutation<void, Pick<ChatMessage, "chat_id" | "message">>({
      query: (data) => ({
        url: "/chat/message",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, args) => [{ type: "Chat", id: args.chat_id }],
    }),
    deleteChatAndMessages: builder.mutation({
      query: (chatId) => ({
        url: `/chat/${chatId}`,
        method: "DELETE",
        invalidatesTags: [
          { type: "Chat", id: "LIST" },
          { type: "ChatMessages", id: "LIST" },
        ],
      }),
    }),

    /* Collections */
    getAllCollections: builder.query<Collection[], void>({
      query: () => "/collection/",
      providesTags: (result) => providesList(result, "Collection"),
    }),
    getLatestCollection: builder.query<Collection, void>({
      query: () => "/collection/latest",
      providesTags: (result) => (result ? [{ type: "Collection", id: result.id }] : ["Collection"]),
    }),
    createCollection: builder.mutation<Collection, Pick<Collection, "name"> & { sources: UUID[] }>({
      query: (data) => ({
        url: "/collection/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Collection", id: "LIST" }],
    }),
    updateCollection: builder.mutation<Collection, { id: UUID; collection: Pick<Collection, "name"> }>({
      query: (args) => ({
        url: `/collection/${args.id}`,
        method: "PUT",
        body: args.collection,
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Collection", id: arg.id }],
    }),
    deleteCollection: builder.mutation<void, UUID>({
      query: (collectionId) => ({
        url: `/collection/${collectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Collection", id: arg }],
    }),

    /* Documents/Folders */
    getAllFolders: builder.query<FolderWithDocuments[], void>({
      query: () => "/file/all",
      providesTags: (result) =>
        result
          ? [
              ...providesList(result, "Folder"),
              ...providesList(
                result?.flatMap((folder) => folder.documents),
                "Document",
              ),
            ]
          : ["Folder"],
    }),
    createDocument: builder.mutation<
      void,
      Pick<Document, "file_name" | "object_key" | "file_size" | "content_type" | "file_metadata" | "folder_id">
    >({
      query: (data) => ({
        url: "file/document",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),
    createFolder: builder.mutation<void, { path: string }>({
      query: (data) => ({
        url: "/file/folder",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Folder", id: "LIST" }],
    }),
    getDocumentsByFolderId: builder.query<Document[], UUID>({
      query: (folderId) => `/file/${folderId}/document`,
      providesTags: (result) => providesList(result, "Document"),
    }),
    deleteDocument: builder.mutation<void, UUID>({
      query: (documentId) => ({
        url: `/file/${documentId}/document`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Document", id: arg }],
    }),
    deleteFolder: builder.mutation({
      query: (folderId) => ({
        url: `/file/${folderId}/folder`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Folder", id: arg }],
    }),
    renameDocument: builder.mutation<Document, { documentId: UUID; newName: string }>({
      query: (data) => ({
        url: `/file/rename-document`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, __, arg) =>
        result
          ? [
              { type: "Document", id: arg.documentId },
              { type: "Folder", id: result.folder_id },
            ]
          : ["Folder"],
    }),
    renameFolder: builder.mutation<void, { folderId: UUID; newName: string }>({
      query: (data) => ({
        url: `/file/rename-folder`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Folder", id: arg.folderId }],
    }),
  }),
});

export default api;
