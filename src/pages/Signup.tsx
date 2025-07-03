import { useDispatch, useSelector } from "react-redux"
import { addUser } from "../store/userSlice"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EyeToggleSVG from "../components/Eye";
import LoginImage from "/login.png";
import axiosInstance from "../config/axiosConfig";
import { isValidEmail, isValidPhoneNumber } from "./Login";
import type { titleProp } from "../types";
import usePageSetup from "../hooks/usePageSetup";

export function isValidDOB(dobString: string) {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!iso8601Regex.test(dobString)) return false;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    const thirteenYearsAgo = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
    );
    const hundredYearsAgo = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate()
    );
    return dob <= thirteenYearsAgo && dob >= hundredYearsAgo;
}

let usernameTimeout: any;

export default function Signup({ title }: titleProp) {
    usePageSetup(title);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showpassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [usernameValid, setUsernameValid] = useState<boolean>(false);
    const [credentials, setCredentials] = useState({
        name: "",
        username: "",
        phone_number: "",
        email: "",
        password: "",
        dob: "",
        otp: ""
    });

    const [phase, setPhase] = useState<number>(1);
    const [timer, setTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(false);

    const user = useSelector((state: any) => state.user);
    const [unverifiedUserID, setUnverifiedUserID] = useState(null);

    const handleSubmit = async function (e: any) {
        e.preventDefault();

        try {
            setIsLoading(true);
            if (phase == 2) {
                console.log(credentials);
                if (!usernameValid) {
                    toast.error("Choose a unique Valid Username");
                    return;
                }
                if (!isValidPhoneNumber(credentials.phone_number)) {
                    toast.error('Phone number must contain exactly 10 digits.');
                    return;
                }
                if (!isValidDOB(credentials.dob)) {
                    toast.error('Must Be atleast 13 years old');
                    return;
                }
                const response = await axiosInstance.post("/user/signup", credentials);
                console.log(response);
                const data = response.data;
                setUnverifiedUserID(data.data);
                setResendDisabled(true);
                toast.success("Now Just Verify with OTP");
                setPhase(3);
            } else if (phase == 3) {
                const response = await axiosInstance.post(`/user/verify-otp/${unverifiedUserID}`, { otp: credentials.otp });
                toast.success("OTP Verified Welcome");
                dispatch(addUser(response.data.data));
            }
        } catch (error: any) {
            console.log(error);
            if (phase == 2) {
                toast.error("Email or Phone Number already exists");
            } else if (phase == 3) {
                toast.error("OTP is Not Valid");
            }
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

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "name") {
            const trimmed = value.trim().toLowerCase();

            const formatted = trimmed
                .split(/\s+/) // split by one or more spaces
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            setCredentials(prev => ({ ...prev, name: formatted }));
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

        if (name === "username") {
            const username = value.replaceAll(" ", "");
            setCredentials(prev => ({ ...prev, username }));
            if (username.length < 3) {
                setUsernameValid(false);
                return;
            }
            if (usernameTimeout) clearTimeout(usernameTimeout);
            setIsLoading(true);
            usernameTimeout = setTimeout(async () => {
                try {

                    const response = await axiosInstance.post("user/username", { username });
                    console.log(response);
                    console.log(username, response.data.data);
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

        // Limit phone number to 10 digits
        if (name === "phone_number" && value.trim().length > 10) return;
        if (name == "otp" && value.trim().length > 6) {
            return;
        }
        if (name == "otp") {
            setCredentials({ ...credentials, [name]: value.replaceAll(" ", "") });
        }
        setCredentials(prev => ({ ...prev, [name]: value.trim() }));
    };

    const nextPhase = () => {
        if (phase == 1) {
            if (!isValidEmail(credentials.email)) {
                toast.error("Not valid Email");
            } else if (!credentials.name.match(/^[a-zA-Z\s]+$/)) {
                toast.error('Name must contain only letters and spaces.');
            } else if (credentials.name.trim().length < 3) {
                toast.error('Name must be at least 3 characters long.');
            } else if (credentials.password.trim().length < 8) {
                toast.error("Not valid Password Min length 8");
            } else {
                setPhase((phase) => phase + 1);
            }
            return;
        }
    }

    const prevPhase = () => {
        if (phase == 1) return;
        setPhase((phase) => phase - 1);
    }

    useEffect(() => {
        let interval: any;
        if (resendDisabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        setResendDisabled(false); // Enable button
                        clearInterval(interval!);
                        return 60; // Reset timer for future use
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendDisabled]);

    const resendOTP = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.post(`/user/resend-otp/${unverifiedUserID}`);
            toast.success("OTP Resent Successfully");
            setTimer(60);
            setResendDisabled(true);
        } catch (error) {
            toast.error("Error in Resending OTP");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col md:flex-row justify-center items-center  min-h-screen m-2 gap-8">
            <div className="h-[60vh] hidden md:block">
                <img src={LoginImage} className="h-full" alt="" />
            </div>
            <div className="flex flex-col  w-full sm:w-md px-10 py-5 rounded-3xl h-100">
                <h1 className="text-3xl text-center font-[cursive]">TJ Social Signup</h1>
                <form className="flex flex-col justify-start" action="" method="get" onSubmit={handleSubmit}>

                    {(phase == 1) && <>
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
                            <label htmlFor="email" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
                            <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type="email" name="email" id="email" placeholder="name@company.com" value={credentials.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block my-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Password</label>
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
                    </>}
                    {(phase == 2) && <>
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
                        <div>
                            <label htmlFor="dob" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your DOB</label>
                            <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type="date" name="dob" id="dob" placeholder="name@company.com" value={credentials.dob}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone_number" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your Phone Number</label>
                            <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type="number" name="phone_number" min={0} max={9999999999} maxLength={10} id="phone_number" placeholder="1111111111" value={credentials.phone_number}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </>}
                    {(phase == 3) && <>
                        <div>
                            <label htmlFor="otp" className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white">Your OTP sent  to <span className="opacity-50 font-semibold cursor-pointer hover:underline"
                            >{credentials.email}</span></label>
                            <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type="number" name="otp" id="otp" placeholder="000000" min={100000} max={999999}
                                value={credentials.otp}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="flex justify-between mt-2">

                            <button
                                onClick={resendOTP}
                                disabled={resendDisabled || isLoading} // Disable the button during loading
                                className={`text-sm text-primary-600 ${(resendDisabled || isLoading) ? 'cursor-not-allowed' : 'hover:underline'}`}>
                                {(resendDisabled || isLoading) ? "Wait To" : "Now"} Resend OTP
                            </button>
                            {resendDisabled && (
                                <span className="text-sm text-gray-500">Resend available in {timer}s</span>
                            )}
                        </div>
                    </>}
                    <div className="flex justify-between mt-4 gap-4">
                        {(phase == 2) && <button type="button" className="w-full text-white  bg-gray-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            onClick={prevPhase}>Previous</button>
                        }
                        <button
                            type="submit"
                            className="w-full dark:text-white bg-red-600 text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            disabled={isLoading}  // Disable the button during loading
                            onClick={nextPhase}
                        >

                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="spinner"></div>
                                </div>) : (
                                (phase < 2) ? "Next" : (phase > 2) ? "Verify OTP" : "Sign Up"  // Default text when not loading
                            )}
                        </button>


                    </div>
                </form>

                <div className="flex items-center w-full my-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="px-4 text-gray-500 text-sm">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <p className="text-sm  ">
                    <span className="text-gray-500 dark:text-gray-400">Already have an account?{` `}</span>
                    <Link to={`/login`} className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                        Log in
                    </Link>
                </p>
            </div>

        </div>
    )
}
