import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider } from './hooks/useToast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Create from './pages/Create'
import Published from './pages/Published'
import Survey from './pages/Survey'
import ThankYou from './pages/ThankYou'
import AdminResults from './pages/AdminResults'
import MySurveys from './pages/MySurveys'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/published" element={<Published />} />
            <Route path="/s" element={<Survey />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/admin" element={<AdminResults />} />
            <Route path="/my-surveys" element={<MySurveys />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  )
}
