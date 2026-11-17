import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Briefcase, ShoppingBag, MessageSquare, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openModal, currentUser, conversations } = useApp();
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const tabs = [
    { key: 'home', label: 'Home', labelAm: 'ዋና ገጽ', icon: Home },
    { key: 'jobs', label: 'Jobs', labelAm: 'ሥራዎች', icon: Briefcase },
    { key: 'marketplace', label: 'Market', labelAm: 'ገበያ', icon: ShoppingBag },
    { key: 'messages', label: 'Chat', labelAm: 'መልእክት', icon: MessageSquare, badge: unreadMessages },
    { key: 'profile', label: 'Profile', labelAm: 'መገለጫ', icon: User, action: () => openModal('profile') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-lg py-1 px-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.action) {
                  tab.action();
                } else {
                  setActiveTab(tab.key as any);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] relative cursor-pointer ${
                isActive ? 'text-[#123B6D]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#123B6D] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
