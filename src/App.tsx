import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ResumeProvider } from './context/ResumeContext'
import { JobProvider } from './context/JobContext'
import { TailorProvider } from './context/TailorContext'
import { ApplicationProvider } from './context/ApplicationContext'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { DiscoverJobs } from './pages/DiscoverJobs'
import { MyMatches } from './pages/MyMatches'
import { ResumeCenter } from './pages/ResumeCenter'
import { Applications } from './pages/Applications'
import { InterviewPrep } from './pages/InterviewPrep'
import { SkillGaps } from './pages/SkillGaps'
import { Companies } from './pages/Companies'
import { MarketIntelligence } from './pages/MarketIntelligence'
import { AICopilot } from './pages/AICopilot'
import { Settings } from './pages/Settings'
import { JobDetail } from './pages/JobDetail'
import { TailorJob } from './pages/TailorJob'

export default function App() {
  return (
    <ResumeProvider>
      <JobProvider>
        <TailorProvider>
          <ApplicationProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="discover" element={<DiscoverJobs />} />
                  <Route path="matches" element={<MyMatches />} />
                  <Route path="jobs/:jobId" element={<JobDetail />} />
                  <Route path="resume" element={<ResumeCenter />} />
                  <Route path="resume/tailor/:jobId" element={<TailorJob />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="interview" element={<InterviewPrep />} />
                  <Route path="skill-gaps" element={<SkillGaps />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="market" element={<MarketIntelligence />} />
                  <Route path="copilot" element={<AICopilot />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ApplicationProvider>
        </TailorProvider>
      </JobProvider>
    </ResumeProvider>
  )
}
