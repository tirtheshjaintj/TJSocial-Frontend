import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { Bounce, toast, ToastContainer } from 'react-toastify';
import axiosInstance from "./config/axiosConfig";
import { addUser } from "./store/userSlice";
import Background from "./components/Background";
import ModeBall from "./components/modeBall";
import Navbar from "./components/Navbar";

export default function App() {
  const dispatch = useDispatch();
  const getUser = async () => {
    try {
      const response = await axiosInstance.get("/user");
      const data = response.data;
      dispatch(addUser(data.data));
      toast.success(`Welcome ${data.data.name}`);
    } catch (error) {
    } finally {
    }
  }
  useEffect(() => {
    getUser();
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  }, []);
  return (
    <>
      <Background>
        <Navbar />
        <Outlet />
        <ToastContainer position="bottom-right" transition={Bounce} limit={3} autoClose={2000} />
        <ModeBall />
      </Background>
    </>
  )
}
