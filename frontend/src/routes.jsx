import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import InterviewForm from "./interview_form";
import Interview from "./interview_page";
import Ats from "./atspage";
import Home from "./homepage";
import Jobs from "./jobPage";
import PrivateRoute from "./privateRoute";
import Login from "./login";
import Signup from "./signup";
import ApplicationHis from "./ApplicationHis";
import Notifications from "./Notifications";
function Route_page() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        
            <Route path="/interviewForm" element={<PrivateRoute redirectTo="/login"><InterviewForm /></PrivateRoute>} />
        
                 <Route path="/interview/:sessionId" element={<Interview />} />

            <Route path="/atsChecking" element={<PrivateRoute redirectTo="/login"><Ats /></PrivateRoute>} />
       

        
            <Route path="/jobs" element={<PrivateRoute redirectTo="/login"><Jobs /></PrivateRoute>} />
        
        <Route path="/login" element = {<Login />} />
        <Route path="/signup" element = {<Signup />} />
       <Route
  path="/applications"
  element={
    <PrivateRoute redirectTo="/login">
      <ApplicationHis />
    </PrivateRoute>
  }
/>
        <Route path="/notifications" element = {<Notifications />} />
      </Routes>
    </Router>
  );
}

export default Route_page;
