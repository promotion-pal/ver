import { Route, Routes } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { Hub } from "@/pages/Hub";
import { SiteDetail } from "@/pages/SiteDetail";

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Hub />} />
        <Route path="sites/:slug" element={<SiteDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
