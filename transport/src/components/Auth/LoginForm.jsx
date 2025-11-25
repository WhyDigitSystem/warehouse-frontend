import Lottie from "lottie-react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import truckAnimation from "../../assets/lottieflow-ecommerce.json";
import {
  loginStart,
  loginSuccess,
  stopLoading,
} from "../../store/slices/authSlice";
import { encryptPassword } from "../../utils/PasswordEnc";
import ForgotPassword from "./ForgotPassword";

const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Handle Login - ONLY here we authenticate and navigate
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    dispatch(loginStart());

    try {
      const loginPayload = {
        userName: username,
        password: encryptPassword(password),
      };

      console.log("Sending login payload:", loginPayload);

      const response = await authAPI.login(loginPayload);
      console.log("Login API success:", response);

      const statusFlag = response?.status;

      // Check if login success or failure
      if (!statusFlag) {
        const errorMsg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Login failed. Please try again.";

        setErrorMessage(errorMsg);
        setLoading(false);
        dispatch(stopLoading());
        return; // STOP execution → do not navigate
      }

      // Only on success
      const userVO = response?.paramObjectsMap?.userVO || {};

      dispatch(
        loginSuccess({
          name: userVO.userName || username,
          email: userVO.email || username,
          token: userVO.token,
          userData: userVO,
          ...response.data,
        })
      );

      // Store user data in localStorage exactly like your original component
      if (userVO) {
        localStorage.setItem("userData", JSON.stringify(userVO));
        localStorage.setItem("authToken", userVO?.token);
        localStorage.setItem("userName", userVO?.userName);
        localStorage.setItem("userType", userVO?.userType);
        localStorage.setItem("email", userVO?.email);
        localStorage.setItem("nickName", userVO?.nickName);
        localStorage.setItem("orgId", userVO.orgId);
        localStorage.setItem("usersId", userVO.usersId);
        localStorage.setItem("employeeName", userVO.employeeName);

        // Store roles and screens exactly like original
        const userRoleVO = userVO.roleVO;
        if (userRoleVO) {
          const roles = userRoleVO.map((row) => ({
            role: row.role,
          }));
          localStorage.setItem("ROLES", JSON.stringify(roles));

          // Store screens exactly like original
          let allScreensVO = [];
          userRoleVO.forEach((roleObj) => {
            roleObj.responsibilityVO.forEach((responsibility) => {
              if (responsibility.screensVO) {
                allScreensVO = allScreensVO.concat(responsibility.screensVO);
              }
            });
          });
          allScreensVO = [...new Set(allScreensVO)];
          localStorage.setItem("screens", JSON.stringify(allScreensVO));
        }

        localStorage.setItem("token", userVO.token);
        localStorage.setItem("tokenId", userVO.tokenId);
        localStorage.setItem("LoginMessage", "true");
      }

      

    } catch (error) {
      console.error("Login API error:", error);
      const errorMsg =
        error?.response?.data?.paramObjectsMap?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials.";

      setErrorMessage(errorMsg);
      setLoading(false);
      dispatch(stopLoading());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(e);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
  };

  // Add this at the beginning of your AuthForm component
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackFromForgotPassword} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  UWL WMS
                </h1>
                <p className="text-xs text-gray-400">
                  Warehouse Management System
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-400">
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm backdrop-blur-sm">
              {errorMessage}
            </div>
          )}

          {/* Main Auth Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username/Login ID */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Login ID"
                required
                className="w-full pl-10 pr-3 py-3.5 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 pr-10 py-3.5 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right mb-3">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <div className="flex items-center justify-center gap-2 text-xs mb-4">
              <Shield className="h-4 w-4" />
              <span>Your data is securely encrypted</span>
            </div>
            <p className="text-xs">
              © 2025 Uniworld Logistics Private Limited · Made with ❤️ in India
            </p>
          </div>
        </div>
      </div>

      {/* Right: Animation Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="starsec"></div>
          <div className="starthird"></div>
          <div className="starfourth"></div>
          <div className="starfifth"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/10 p-4 shadow-xl">
                <Lottie
                  animationData={truckAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                Revolutionize Your
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Logistics
                </span>
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold text-base">Real-time Tracking</h4>
                    <p className="text-blue-100/80 text-xs">Live GPS monitoring</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold text-base">Smart Routing</h4>
                    <p className="text-blue-100/80 text-xs">AI-powered optimization</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-semibold text-base">Secure Payments</h4>
                    <p className="text-blue-100/80 text-xs">Encrypted transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the star animation styles */}
      <style jsx>{`
        .starsec, .starthird, .starfourth, .starfifth {
          position: absolute;
          width: 3px;
          height: 3px;
          background: transparent;
          animation: animStar 150s linear infinite;
        }

        .starthird { animation-duration: 100s; }
        .starfourth { animation-duration: 50s; }
        .starfifth { animation-duration: 80s; }

        @keyframes animStar {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-2000px); }
        }

        /* Add the star patterns from your original CSS */
        .starsec {
          box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
            234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
            633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
            76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b;
        }

        .starthird {
          box-shadow: 544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
            168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0;
        }

        .starfourth {
          box-shadow: 104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
            1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722;
        }

        .starfifth {
          box-shadow: 340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
            1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800;
        }
      `}</style>
    </div>
  );
};

export default AuthForm;