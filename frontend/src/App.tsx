import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { TicketsListPage } from "@/features/tickets/TicketsListPage";
import { TicketDetailPage } from "@/features/tickets/TicketDetailPage";
import { CreateTicketPage } from "@/features/tickets/CreateTicketPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TicketsListPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
