import { useEffect, useState } from "react";
import { FaDownload, FaUsers } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../config/axiosConfig";
import { addUser } from "../store/userSlice";

let deferredPrompt: any = null;

export default function AppNavbar() {
    const user = useSelector((state: any) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isInstallable, setIsInstallable] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            deferredPrompt = e;
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const install = async () => {
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                    console.log("User accepted the install prompt");
                    deferredPrompt = null;
                    setIsInstallable(false);
                } else {
                    console.log("User dismissed the install prompt");
                }
            } catch (err) {
                console.error("Failed to install the app", err);
                toast.error("Failed to install the app");
            }
        }
    };

    const signOut = async () => {
        try {
            await axiosInstance.post("/user/logout");
            localStorage.clear();
            toast.success("Signed out successfully");
            dispatch(addUser(null));
            navigate("/login");
        } catch (error) {
            toast.error("Not able to Logout");
        }
    };



    return (
        <motion.div
            className="w-full sticky top-0 z-50 shadow-md backdrop-blur-xl cursor-pointer bg-white/50 dark:bg-gray-900/50 px-4 md:px-8 py-3 flex items-center justify-between"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Link to="/" onClick={install} className="flex items-center gap-2 text-3xl sm:text-2xl font-bold text-gray-800 dark:text-white hover:scale-105 transition">
                <FaUsers />TJ
                <span className="hidden sm:inline-block"> Social</span>
            </Link>

            <div className="relative">
                <div
                    tabIndex={0}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setDropdownOpen(false)}
                    className="relative"
                >
                    <img
                        src={user?.profile_pic || "/profile-default.webp"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 hover:ring-2 hover:ring-blue-400 transition"
                    />
                </div>

                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            className="absolute right-0 mt-4 w-48 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-xl overflow-hidden z-50"
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {!user ? (
                                <div className="flex flex-col text-sm text-gray-800 dark:text-gray-200 ">
                                    <Link to="/login" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ">Login</Link>
                                    <hr className="opacity-20" />
                                    <Link to="/signup" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Signup</Link>
                                </div>
                            ) : (
                                <div className="flex flex-col text-sm text-gray-800 dark:text-gray-200" title={user?.name}>
                                    <Link to={`/user/${user.username}`} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        Profile @{user.username}
                                    </Link>
                                    <hr className="opacity-20" />
                                    <button onClick={signOut} className="px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 w-full cursor-pointer">
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
