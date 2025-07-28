import { useEffect, useMemo, useState } from "react";
import { FaCamera, FaPencilAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { isValidDOB } from "../pages/Signup";
import axiosInstance from "../config/axiosConfig";
import { addUser } from "../store/userSlice";
import { motion } from "framer-motion";
import ModalContainer from "./ModalContainer";

interface UpdateProfileProps {
    open_status: boolean;
    onClose: () => void;
}
let usernameTimeout: any;

function UpdateProfileModal({ open_status, onClose }: UpdateProfileProps) {
    const [profile_pic, setProfilePic] = useState<File | null>(null);
    const [cover_pic, setCoverPic] = useState<File | null>(null);
    const user = useSelector((state: any) => state.user);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [usernameValid, setUsernameValid] = useState<boolean>(true);
    const dispatch = useDispatch();
    const [credentials, setCredentials] = useState({
        name: "",
        username: "",
        dob: "",
        account_type: "",
        bio: ""
    });

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "name") {
            const trimmed = value.trim().toLowerCase();

            const formatted = trimmed
                .split(/\s+/) // split by one or more spaces
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            setCredentials(prev => ({ ...prev, [name]: formatted }));
        }
    };
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        console.log(value);
        // No spaces in username
        if (name === "name") {
            setCredentials(prev => ({ ...prev, name: value }));
            return;
        }
        if (name === "bio") {
            setCredentials(prev => ({ ...prev, bio: value.replaceAll("  ", " ") }));
            return;
        }

        if (name === "username") {
            const username = value.replaceAll(" ", "");
            setCredentials(prev => ({ ...prev, username }));
            if (username.length < 3) {
                setUsernameValid(false);
                return;
            }
            if (usernameTimeout) clearTimeout(usernameTimeout);
            if (username == user?.username) {
                setUsernameValid(true);
                return;
            }
            setIsLoading(true);
            usernameTimeout = setTimeout(async () => {
                try {
                    const response = await axiosInstance.post("user/username", { username });
                    if (username == response.data.data) {
                        setUsernameValid(true);
                    }
                } catch (error) {
                    console.log(error);
                    setUsernameValid(false);
                } finally {
                    setIsLoading(false);
                }
            }, 1500);
            return;
        }
        setCredentials(prev => ({ ...prev, [name]: value.trim() }));
    };
    const handleSubmit = async function (e: any) {
        e.preventDefault();
        try {
            setIsLoading(true);
            if (!usernameValid) {
                toast.error("Choose a unique Valid Username");
                return;
            }
            if (!isValidDOB(credentials.dob)) {
                toast.error('Must Be atleast 13 years old');
                return;
            }
            if (!credentials.name.match(/^[a-zA-Z\s]+$/)) {
                toast.error('Name must contain only letters and spaces.');
                return;
            }
            if (credentials.name.trim().length < 3) {
                toast.error('Name must be at least 3 characters long.');
                return;
            }
            const formData = new FormData();
            formData.append("name", credentials.name.trim());
            formData.append("username", credentials.username.trim());
            formData.append("dob", credentials.dob);
            formData.append("bio", credentials.bio);
            formData.append("account_type", credentials.account_type);

            // Append images only if selected
            if (profile_pic) formData.append("profile_pic", profile_pic);
            if (cover_pic) formData.append("cover_pic", cover_pic);

            const response = await axiosInstance.patch("/user/update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setProfilePic(null);
            setCoverPic(null);
            const data = response.data;
            dispatch(addUser(data.data));
            toast.success("Account Updated Successfully");
        } catch (error: any) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }

    }

    const profile_pic_preview = useMemo(() => {
        return profile_pic ? URL.createObjectURL(profile_pic) : (user?.profile_pic || '/profile-default.webp');
    }, [profile_pic, user]);

    const cover_pic_preview = useMemo(() => {
        return cover_pic ? URL.createObjectURL(cover_pic) : (user?.cover_pic || '/cover-default.jpg');
    }, [cover_pic, user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const target = e.target.dataset.type; // 'profile' or 'cover'

        if (!file || !target) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Invalid file. Please upload a valid image.");
            if (target === "profile") setProfilePic(null);
            else if (target === "cover") setCoverPic(null);
            e.target.value = "";
            return;
        }

        if (target === "profile") {
            setProfilePic(file);
        } else if (target === "cover") {
            setCoverPic(file);
        }
    };


    useEffect(() => {
        if (user) {
            const date = new Date(user.dob);
            const dob = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
            //@ts-ignore
            setCredentials({ name: user.name, username: user.username, dob, account_type: user.account_type, bio: user.bio });
        }
    }, [user]);

    return (
        <ModalContainer onClose={onClose} open_status={open_status}>
            {/* Modal Box */}
            <motion.form
                onSubmit={handleSubmit}
                className="relative flex flex-col w-full max-w-6xl pb-10 md:pb-6 bg-white max-h-[100vh] overflow-auto dark:bg-gray-900 p-4 rounded-2xl shadow-xl"
                initial={{ y: "-50%", opacity: 0, scale: 0.8 }}
                animate={{ y: "0%", opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ ease: "easeInOut" }}
            >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 ">
                    <span className="inline-flex items-center gap-2"> Update Profile <FaPencilAlt /></span>
                </h2>

                {/* Cover Pic */}
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        id="cover_pic"
                        data-type="cover"
                        hidden
                        onChange={handleImageChange}
                    />
                    <label htmlFor="cover_pic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <div
                            style={{
                                backgroundImage: `url(${cover_pic_preview})`,
                            }}
                            className="w-full h-32 bg-repeat-round bg-contain rounded-b-4xl shadow-lg relative cursor-pointer"
                        >
                            <FaCamera className="absolute top-2 right-2 bg-black text-white text-2xl p-1 rounded-md" />
                        </div>
                    </label>
                </div>

                {/* Profile Pic */}
                <div className="flex flex-col gap-4 mt-6">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            id="profile_pic"
                            data-type="profile"
                            hidden
                            onChange={handleImageChange}
                        />
                        <label htmlFor="profile_pic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                            <div
                                style={{
                                    backgroundImage: `url(${profile_pic_preview})`,
                                }}
                                className="w-24 h-24 rounded-full bg-cover bg-no-repeat bg-center border-4 border-white dark:border-gray-800 shadow-lg -mt-26 relative cursor-pointer"
                            >
                                <FaCamera className="absolute bottom-1 right-1 bg-black text-white text-xl p-1 rounded-md" />
                            </div>
                        </label>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Name</label>
                    <input
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        type="text" name="name" id="name" placeholder="John Doe" value={credentials.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="username" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Username ( {(usernameValid) ? "✅" : "❌"} )</label>
                    <div
                        className="relative">
                        <input
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text" name="username" minLength={3} id="username" placeholder="John Doe" value={credentials.username}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 text-xl p-3 bg-gray-50 border-gray-300 dark:bg-gray-700  flex items-center justify-center  leading-5 rounded-lg border-1 dark:border-gray-600"
                        >
                            {(isLoading) ? <div className="spinner"></div> : <span className={(usernameValid) ? "text-[#008000] font-bold" : "text-[#ff0000] font-bold"}>@</span>}
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 justify-around flex-wrap">
                    <div className="flex-1">
                        <label htmlFor="dob" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your DOB</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="date" name="dob" id="dob" value={credentials.dob}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="account_type" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Account Type</label>
                        <select className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            name="account_type" id="account_type" value={credentials.account_type}
                            //@ts-ignore
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        >
                            <option value="public">Public 👁️</option>
                            <option value="private">Private 🔒</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="bio" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Bio</label>
                    <textarea
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        type="text" name="bio" id="bio" placeholder="Tell about Yourself" value={credentials.bio}
                        //@ts-ignore
                        onChange={handleChange}
                        handleBlur={handleBlur}
                        tabIndex={1}
                        disabled={isLoading}
                        required
                    />
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end mt-6 gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 hover:text-black cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        autoFocus={false} // 👈 prevents accidental triggering
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="spinner"></div>
                            </div>) : (
                            `Update`  // Default text when not loading
                        )}
                    </button>
                </div>
            </motion.form>
        </ModalContainer>

    );
}

export default UpdateProfileModal;
