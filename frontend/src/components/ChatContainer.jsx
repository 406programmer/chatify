import { useEffect, useRef } from "react"
import { useChatStore } from "../store/useChatStore"
import ChatHeader from "./ChatHeader"
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder"
import { useAuthStore } from "../store/useAuthStore"
import MessageInput from "./MessageInput"
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton"

export default function ChatContainer() {
  const {selectedUser,getMessagesByUserId,messages,isMessageLoading,subscribeToMessages,unsubscribeFromMessages } = useChatStore()
  const {authUser} = useAuthStore()
  const messageEndRef = useRef(null)

  useEffect(()=>{
    getMessagesByUserId(selectedUser._id)
    subscribeToMessages()

    return ()=> unsubscribeFromMessages()
  },[getMessagesByUserId,selectedUser._id,subscribeToMessages,unsubscribeFromMessages])
 
  useEffect(()=>{
    if(messageEndRef.current){
      messageEndRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages])


  return (
    <>
      <ChatHeader />

      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessageLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => {

            const messageDate = new Date(message.createdAt).toDateString();
            const previousMessageDate = index > 0 
              ? new Date(messages[index - 1].createdAt).toDateString() 
              : null;
              const isNewDay = messageDate !== previousMessageDate;
              return(
                <div key={message._id} >                
               {isNewDay && (
                  <div className="flex justify-center my-8">
                    <span className="bg-slate-700 text-slate-300 text-xs px-4 py-1 rounded-full font-medium uppercase tracking-wider">
                      {formatHeaderDate(message.createdAt)}
                    </span>
                  </div>
                )}
              <div
                key={message._id}
                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    message.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                    />
                  )}
                  {message.text && <p className="mt-2">{message.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(message.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="chat-footer mt-1 text-xs opacity-40">
                  {message.receiverId === authUser._id
                    ? ""
                    : message.status === "seen" && message.seenAt
                    ? `seen at ${new Date(message.seenAt).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}`
                    : message.status}
                </div>
              </div>
                    </div>
              )
})}
            <div ref={messageEndRef} />
          </div>
        ) : isMessageLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />
    
    </>
  );
}

const formatHeaderDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  // Set times to 0 to compare just the calendar dates
  const diffInDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};