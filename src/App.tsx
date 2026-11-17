/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { CategoryNavStrip } from './components/layout/CategoryNavStrip';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';

// Home Components
import { Hero } from './components/home/Hero';
import { UniversalSearch } from './components/home/UniversalSearch';
import { CategoryGrid } from './components/home/CategoryGrid';
import { OrthodoxCalendarWidget } from './components/home/OrthodoxCalendarWidget';
import { FeaturedSections } from './components/home/FeaturedSections';
import { CommunitySuccessStories } from './components/home/CommunitySuccessStories';
import { TrustAndHowItWorks } from './components/home/TrustAndHowItWorks';
import { DailySpiritualQuote } from './components/home/DailySpiritualQuote';
import { CommunityPrayersBoard } from './components/prayers/CommunityPrayersBoard';

// Feature Views
import { JobsView } from './components/jobs/JobsView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { ServicesView } from './components/services/ServicesView';
import { BusinessesView } from './components/businesses/BusinessesView';
import { ProfessionalsView } from './components/professionals/ProfessionalsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { MessagesView } from './components/messages/MessagesView';
import { AboutView } from './components/about/AboutView';
import { AIContentStudioView } from './components/ai/AIContentStudioView';
import { OrthodoxKnowledgeView } from './components/knowledge/OrthodoxKnowledgeView';
import { AIAssistantWidget } from './components/ai/AIAssistantWidget';

// Modals
import { PostCreationModal } from './components/post/PostCreationModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { AdminModal } from './components/admin/AdminModal';
import { JobDetailModal } from './components/jobs/JobDetailModal';
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { ContactModal } from './components/contact/ContactModal';
import { CVUploadModal } from './components/jobs/CVUploadModal';
import { LiveActivityTicker } from './components/common/LiveActivityTicker';
import { OfflineIndicator } from './components/common/PWAInstallButton';

const MainContent: React.FC = () => {
  const { activeTab, activeModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <CategoryNavStrip />
      <LiveActivityTicker />

      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <Hero />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <UniversalSearch />
            </div>
            <DailySpiritualQuote />
            <CategoryGrid />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
              <CommunityPrayersBoard compact />
            </div>
            <OrthodoxCalendarWidget />
            <FeaturedSections />
            <CommunitySuccessStories />
            <TrustAndHowItWorks />
          </div>
        )}

        {activeTab === 'knowledge' && <OrthodoxKnowledgeView />}
        {activeTab === 'prayers' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CommunityPrayersBoard />
          </div>
        )}
        {activeTab === 'jobs' && <JobsView />}
        {activeTab === 'marketplace' && <MarketplaceView />}
        {activeTab === 'services' && <ServicesView />}
        {activeTab === 'businesses' && <BusinessesView />}
        {activeTab === 'professionals' && <ProfessionalsView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'messages' && <MessagesView />}
        {activeTab === 'about' && <AboutView />}
        {activeTab === 'ai-studio' && <AIContentStudioView />}
      </main>

      <Footer />
      <BottomNav />
      <AIAssistantWidget />
      <OfflineIndicator />

      {/* Global Modals */}
      {activeModal === 'post' && <PostCreationModal />}
      {activeModal === 'auth' && <AuthModal />}
      {activeModal === 'profile' && <ProfileModal />}
      {activeModal === 'notifications' && <NotificationsModal />}
      {activeModal === 'admin' && <AdminModal />}
      {activeModal === 'job_detail' && <JobDetailModal />}
      {activeModal === 'product_detail' && <ProductDetailModal />}
      {activeModal === 'contact' && <ContactModal />}
      {activeModal === 'cv_upload' && <CVUploadModal />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
