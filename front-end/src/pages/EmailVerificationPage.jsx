import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const EmailVerificationPage = () => {

	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();

	const { error, isLoading, verifyEmail, setScrollHide } = useAuthStore();

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			navigate("/");
			toast.success("Email verified successfully");
		} catch (error) {
			console.log(error);
		}
	};

	const handleClickOutside = (e) => {
		if (e.target.classList.contains("absolute")) {
			setScrollHide(false);
			navigate("/");
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
		document.addEventListener("click", handleClickOutside);
		setScrollHide(true);
		return () => {
			setScrollHide(false);
		}
	}, [code]);

	return (
		<div className="click flex items-center justify-center min-h-screen bg-[#0a0a0a] h-screen w-screen absolute bg-opacity-70">
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-gradient-to-br border-[1px] border-[#212121] bg-[#0a0a0a] p-8 w-full max-w-md rounded-2xl shadow-2xl"
			>
				<h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-gray-300 to-gray-400 text-transparent bg-clip-text">
					Verify Your Email
				</h2>
				<p className="text-center text-gray-400 mb-6">Enter the 6-digit code sent to your email address.</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="flex justify-between">
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className="w-12 h-12 text-center text-2xl font-bold bg-[#0a0a0a] text-gray-200 border-2 border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
							/>
						))}
					</div>
					{error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						type="submit"
						disabled={isLoading || code.some((digit) => !digit)}
						className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-gray-600 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50"
					>
						{isLoading ? "Verifying..." : "Verify Email"}
					</motion.button>
				</form>
			</motion.div>
		</div>
	);
};

export default EmailVerificationPage;
