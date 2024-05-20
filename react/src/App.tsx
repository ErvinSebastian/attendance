import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Settings from './pages/Settings';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import UsersPage from './pages/UsersPage';
import UserForm from './pages/Form/UserForm';
import CourseList from './pages/CourseList';
import SubjectList from './pages/SubjectList';
import SubjectForm from './pages/Subjects/SubjectForm';
import ClassList from './pages/ClassList';
import ClassForm from './pages/Form/ClassForm';
import ReportPage from './pages/ReportPage';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const [token, setToken] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {}, [token]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const stringSession = sessionStorage.getItem('token');
    const session = stringSession ? stringSession : '';
    setToken(session);
  }, []);

  if (!token) {
    return (
      <Routes>
        <Route
          path="/"
          index
          element={
            <>
              <PageTitle title="Sign In | Qrize App" />
              <SignIn setToken={setToken} />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <PageTitle title="Register | Qrize App" />
              <SignUp />
            </>
          }
        />
      </Routes>
    );
  }

  if (token) {
    return loading ? (
      <Loader />
    ) : (
      <>
        <Routes>
          <Route
            index
            element={
              <>
                <PageTitle title="Sign In | Qrize App" />
                <SignIn setToken={setToken} />
              </>
            }
          />

          <Route
            path="/dashboard"
            element={
              <>
                <PageTitle title="Dashboard | Qrize App" />
                <ECommerce />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <PageTitle title="Register | Qrize App" />
                <SignUp />
              </>
            }
          />

          <Route
            path="/users"
            element={
              <>
                <PageTitle title="Users | Qrize App" />
                <UsersPage />
              </>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <>
                <PageTitle title="User Form | Qrize App" />
                <UserForm />
              </>
            }
          />
          <Route
            path="/users/add/"
            element={
              <>
                <PageTitle title="User Form | Qrize App" />
                <UserForm />
              </>
            }
          />
          <Route
            path="/calendar"
            element={
              <>
                <PageTitle title="Calendar | Qrize App" />
                <Calendar />
              </>
            }
          />
          {/* <Route
            path="/profile"
            element={
              <>
                <PageTitle title="Profile | Qrize App" />
                <Profile />
              </>
            }
          /> */}
          <Route
            path="/forms/form-elements"
            element={
              <>
                <PageTitle title="Form Elements | Qrize App" />
                <FormElements />
              </>
            }
          />
          <Route
            path="/forms/form-layout"
            element={
              <>
                <PageTitle title="Form Layout | Qrize App" />
                <FormLayout />
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <>
                <PageTitle title="Settings | Qrize App" />
                <Settings />
              </>
            }
          />
          <Route
            path="/chart"
            element={
              <>
                <PageTitle title="Basic Chart | Qrize App" />
                <Chart />
              </>
            }
          />
          <Route
            path="/maintenance/courses"
            element={
              <>
                <PageTitle title="Courses | Qrize App" />
                <CourseList />
              </>
            }
          />
          <Route
            path="/maintenance/subjects/edit/:id"
            element={
              <>
                <PageTitle title="Subject Form | Qrize App" />
                <SubjectForm />
              </>
            }
          />
          <Route
            path="/maintenance/subjects/add"
            element={
              <>
                <PageTitle title="Subject Form | Qrize App" />
                <SubjectForm />
              </>
            }
          />
          <Route
            path="/maintenance/reports"
            element={
              <>
                <PageTitle title="Reports | Qrize App" />
                <ReportPage />
              </>
            }
          />
          <Route
            path="/maintenance/subjects"
            element={
              <>
                <PageTitle title="Subjects | Qrize App" />
                <SubjectList />
              </>
            }
          />
          <Route
            path="/classes/add"
            element={
              <>
                <PageTitle title="Class Form | Qrize App" />
                <ClassForm />
              </>
            }
          />
          <Route
            path="/classes"
            element={
              <>
                <PageTitle title="Classes | Qrize App" />
                <ClassList />
              </>
            }
          />
          <Route
            path="/classes/edit/:id"
            element={
              <>
                <PageTitle title="Class Form | Qrize App" />
                <ClassForm />
              </>
            }
          />
          <Route
            path="/ui/alerts"
            element={
              <>
                <PageTitle title="Alerts | Qrize App" />
                <Alerts />
              </>
            }
          />
          <Route
            path="/ui/buttons"
            element={
              <>
                <PageTitle title="Buttons | Qrize App" />
                <Buttons />
              </>
            }
          />
          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Signin | Qrize App" />
                <SignIn />
              </>
            }
          />
          {/* <Route
            path="/auth/signup"
            element={
              <>
                <PageTitle title="Signup | Qrize App" />
                <SignUp />
              </>
            }
          /> */}
        </Routes>
      </>
    );
  }
}

export default App;
