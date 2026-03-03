import { AuthPage } from "./pages/auth.js";
import { HomePage } from "./pages/home.js";
import { AppointmentsPage } from "./pages/appointments.js";
import { ProfilePage } from "./pages/profile.js";
import { BookServicePage } from "./pages/book_service.js";
import { BookBarberPage } from "./pages/book_barber.js";
import { BookDateTimePage } from "./pages/book_datetime.js";
import { BookConfirmPage } from "./pages/book_confirm.js";
import { BarberPanelPage } from "./pages/barber.js";
import { AdminPage } from "./pages/admin.js";

export const routes = {
  "/auth": { page: AuthPage, public:true, nav:false },
  "/home": { page: HomePage, nav:true },
  "/appointments": { page: AppointmentsPage, nav:true },
  "/profile": { page: ProfilePage, nav:true },

  "/book/service": { page: BookServicePage, nav:false },
  "/book/barber": { page: BookBarberPage, nav:false },
  "/book/datetime": { page: BookDateTimePage, nav:false },
  "/book/confirm": { page: BookConfirmPage, nav:false },

  "/barber": { page: BarberPanelPage, nav:false, role:"barbeiro" },
  "/admin": { page: AdminPage, nav:false, role:"admin" },
};
