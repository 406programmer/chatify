import { create } from "zustand";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const notificationSound = new Audio("/sounds/notification.mp3");

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessageLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },
  getAllContacts: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      console.log("Error in getMyChatPartners", error);
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessagesByUserId: async (userId) => {
    set({ isMessageLoading: true });
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      if (socket && authUser) {
        socket.emit("mark-as-seen", {
          senderId: userId,
          userId: authUser._id,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessageLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      status: "sent",
      isOptimistic: true,
    };
    //immediately update the ui by adding the optimistic message
    set({ messages: [...messages, optimisticMessage] });
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      //remove the optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },
  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) {
      return;
    }
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      socket.emit("mark-as-seen", {
      senderId: selectedUser._id,
      userId: useAuthStore.getState().authUser._id,
    });
  });
      socket.on("messages-seen-update", ({ seenBy }) => {
        if (selectedUser._id === seenBy) {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.receiverId === seenBy && m.status !== "seen"
                ? { ...m, status: "seen",seenAt : new Date().toISOString() }
                : m,
            ),
          }));
        }
      });

      if (isSoundEnabled) {
        notificationSound.currentTime = 0;
        notificationSound
          .play()
          .catch((e) => console.log("AUdio play failed:", e));
      }
    
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messages-seen-update");
  },
}));
