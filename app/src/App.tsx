import { Route, Routes } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { Analytics } from "@/pages/Analytics";
import { Hub } from "@/pages/Hub";
import { JournalPage } from "@/pages/JournalPage";
import { SiteDetail } from "@/pages/SiteDetail";

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Hub />} />
        <Route path="sites/:slug" element={<SiteDetail />} />
        <Route path="journals/:slug" element={<JournalPage />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
