import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative flex w-screen max-w-6xl lg:p-4 lg:h-[700px] h-[95vh]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div
          className={`lg:w-80 sm:w-full ${selectedUser ? "hidden lg:flex" : "flex w-full"} bg-slate-800/50 backdrop-blur-sm  flex flex-col`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div
            className={`flex-1 flex-col ${selectedUser ? "hidden lg:flex": "flex" }  overflow-y-auto p-4 space-y-2`}
          >
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`flex-1 ${selectedUser ? "flex" : "hidden lg:flex"}  flex-col bg-slate-900/50 backdrop-blur-sm`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
