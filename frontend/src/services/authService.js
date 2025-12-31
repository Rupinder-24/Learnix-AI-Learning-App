import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

// registerUser
const register = async (name, email, password,profileImageUrl) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            name,
            email,
            password,
            profileImageUrl
        });

        return response.data;
    } catch (error) {

        res.status(500).json({ message: "Server error", error: error.message });

    }
}
// loginuser
const login= async (email, password) => {
    try {

        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
            email,
            password
        });

        return response.data;



    } catch (error) {

        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// profile
const getUserProfile = async () => {
    try {
        const response=await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;


    }
        
     catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });

}
}


// update profile
const updateUserProfile = async (userData) => {
    try {
      const response=await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE,userData);
      return response.data;


    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });

    }
}

// changed password
const changePassword = async (passsword) => {
    try {
        const response=await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD,password);
      return response.data;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const authService= {
     register, 
     login,
      getUserProfile, 
      updateUserProfile,
       changePassword,
     };

export default authService;