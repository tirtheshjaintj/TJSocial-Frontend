import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { addUser } from '../store/userSlice';

interface GoogleBoxProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const GoogleBox: React.FC<GoogleBoxProps> = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoading(true);
      if (!credentialResponse.credential) {
        throw new Error("No credential provided.");
      }

      // Send POST request to the backend
      const response = await axiosInstance.post(`/user/google_login`, {
        token: credentialResponse.credential
      });

      console.log(response);
      toast.success("Google LogIn successful");
      dispatch(addUser(response.data.data));

    } catch (error: any) {
      console.error(error);
      const errorMsg = "Google Login failed.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Login failed");
  };

  useEffect(() => {

    if (user) navigate("/");

  }, [user]);

  return (
    <div className="flex justify-center items-center">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={handleGoogleLoginError}
      />
    </div>
  );
};

export default GoogleBox;
