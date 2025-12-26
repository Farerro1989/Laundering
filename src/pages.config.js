import AccountDetail from './pages/AccountDetail';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import DataBackup from './pages/DataBackup';
import ExpenseCategories from './pages/ExpenseCategories';
import ExpenseDashboard from './pages/ExpenseDashboard';
import ExpenseList from './pages/ExpenseList';
import ExpenseReports from './pages/ExpenseReports';
import Home from './pages/Home';
import ProfitDetails from './pages/ProfitDetails';
import SystemSelector from './pages/SystemSelector';
import TelegramMessages from './pages/TelegramMessages';
import TelegramSetup from './pages/TelegramSetup';
import Transactions from './pages/Transactions';
import UserManagement from './pages/UserManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccountDetail": AccountDetail,
    "Analytics": Analytics,
    "Dashboard": Dashboard,
    "DataBackup": DataBackup,
    "ExpenseCategories": ExpenseCategories,
    "ExpenseDashboard": ExpenseDashboard,
    "ExpenseList": ExpenseList,
    "ExpenseReports": ExpenseReports,
    "Home": Home,
    "ProfitDetails": ProfitDetails,
    "SystemSelector": SystemSelector,
    "TelegramMessages": TelegramMessages,
    "TelegramSetup": TelegramSetup,
    "Transactions": Transactions,
    "UserManagement": UserManagement,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};