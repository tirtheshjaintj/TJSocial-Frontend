import { useDispatch, useSelector } from "react-redux"
import { addUser } from "../store/userSlice"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EyeToggleSVG from "../components/Eye";
import LoginImage from "/login.png";
import axiosInstance from "../config/axiosConfig";
import usePageSetup from "../hooks/usePageSetup";
import type { titleProp } from "../types";
import GoogleBox from "../components/GoogleBox";

export const isValidEmail = (email: string) => {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

export const isValidPhoneNumber = (phone_number: string) => {
    return /^[0-9]{10}$/.test(phone_number)
}
export default function Login({ title }: titleProp) {
    usePageSetup(title);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showpassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });


    const user = useSelector((state: any) => state.user);
    const handleSubmit = async function (e: any) {
        e.preventDefault();
        if (!isValidEmail(credentials.email)) {
            toast.error("Not valid Credentials");
            return;
        }
        if (credentials.password.trim().length < 8) {
            toast.error("Not valid Credentials");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axiosInstance.post("/user/login", credentials);
            const data = response.data;
            dispatch(addUser(data.data));
            toast.success("Login Successful");
            
        } catch (error) {
            console.log(error);
            toast.error("Not valid Credentials");
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    const handleShowPasswordToggle = () => {
        setShowPassword((prev) => !prev);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value.trim() });
    }

    return (
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:mt-16  min-h-screen m-2 gap-8">
            <div className="h-[60vh] hidden md:block">
                <img src={LoginImage} className="h-full" alt="" />
            </div>
            <div className="flex flex-col  w-full sm:w-md px-10 py-5 rounded-3xl h-100">
                <h1 className="text-3xl text-center ">TJ Social Login</h1>
                <form className="flex flex-col justify-start" action="" method="get" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="email" name="email" id="email" placeholder="name@company.com" value={credentials.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block my-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Password</label>
                        <div className="relative">
                            <input className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type={(showpassword) ? "text" : "password"} name="password" id="password"
                                placeholder="••••••••"
                                minLength={8}
                                value={credentials.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 p-3 bg-gray-50 border-gray-300 dark:bg-gray-700  flex items-center justify-center text-sm leading-5 rounded-lg border-1 dark:border-gray-600"
                                onClick={handleShowPasswordToggle}
                            >
                                <EyeToggleSVG showpassword={showpassword} />
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-8 cursor-pointer dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        disabled={isLoading}  // Disable the button during loading
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="spinner"></div>
                            </div>) : (
                            `Sign In`  // Default text when not loading
                        )}
                    </button>
                    <div className="mt-5">
                        <GoogleBox setIsLoading={setIsLoading} />
                    </div>
                </form>

                <div className="flex items-center w-full my-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="px-4 text-gray-500 text-sm">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <Link to={`/forgot-password`} className="text-sm w-min font-medium text-primary-600 hover:underline dark:text-primary-500">
                    <span className="hover:underline">Forgot Password?{` `}</span>
                </Link>
                <p className="text-sm  ">
                    <span className="text-gray-500 dark:text-gray-400">Don’t have an account yet?{` `}</span>
                    <Link to={`/signup`} className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                        Sign up
                    </Link>
                </p>
            </div>

        </div>
    )
}
